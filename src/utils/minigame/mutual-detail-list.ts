/** zhiwo pages/mutual-results-detail mutual 列表行规范化 + 全量拉取合并 */
import * as mg from "@/api/minigame";
import { minigameApp } from "@/state/minigame-app";
import { normalizeRecordIdKey } from "@/utils/minigame/route-query";
import type { NormalizedSelfRecord } from "@/utils/minigame/normalize-records";
import {
  buildRecordResultPresentation,
  mutualResultsMatch,
  type RecordResultPresentation,
} from "@/utils/minigame/record-result-display";
import { publicAvatarUrl } from "@/utils/minigame/avatar-url";
import { syncRecordMutualCounts } from "@/utils/minigame/record-sync";
import type { SessionQuizId } from "@/state/minigame-app";
import { resolveRecordQuizId } from "@/utils/minigame/quiz-id";
import { filterMutualListByQuizId } from "@/utils/minigame/mutual-scored-aggregate";

export function findSelfRecordById(recordId: string): NormalizedSelfRecord | null {
  const raw = minigameApp.records as unknown[];
  if (!Array.isArray(raw)) return null;
  const key = normalizeRecordIdKey(recordId);
  if (!key) return null;
  return (
    (raw as NormalizedSelfRecord[]).find((r) => r && normalizeRecordIdKey(r.id) === key) ||
    null
  );
}

function pickSelfTestId(mutualRaw: unknown): string {
  if (!mutualRaw || typeof mutualRaw !== "object") return "";
  const o = mutualRaw as { selfTestId?: unknown; self_test_id?: unknown };
  const a = o.selfTestId;
  const b = o.self_test_id;
  if (a != null && String(a).trim()) return String(a).trim();
  if (b != null && String(b).trim()) return String(b).trim();
  return "";
}

function truncateName(name: string): string {
  if (!name) return "";
  return name.length > 5 ? `${name.slice(0, 5)}...` : name;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatMutualRowTime(createdAt: unknown): string {
  const t = typeof createdAt === "number" ? createdAt : Date.parse(String(createdAt ?? ""));
  if (!Number.isFinite(t)) return "";
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function pickFriendField(raw: unknown, camel: string, snake: string): string {
  if (!raw || typeof raw !== "object") return "";
  const o = raw as Record<string, unknown>;
  const a = o[camel];
  if (a != null && String(a).trim()) return String(a).trim();
  const b = o[snake];
  if (b != null && String(b).trim()) return String(b).trim();
  return "";
}

export interface MutualFriendRowVm {
  id: string;
  friendNickName: string;
  friendAvatarUrl: string;
  friendAvatarLoadFailed: boolean;
  friendType: string;
  friendAlias: string;
  viewerSelfType: string;
  viewerSelfAlias: string;
  quizId: SessionQuizId;
  timeText: string;
  chipText: string;
  chipSame: boolean;
  raw: unknown;
}

function resolveViewerSelfPresentation(
  mutualRaw: unknown,
  pageSelfFallback: RecordResultPresentation | null,
): RecordResultPresentation {
  const sid = pickSelfTestId(mutualRaw);
  if (sid) {
    const rec = findSelfRecordById(sid);
    if (rec) return buildRecordResultPresentation(rec);
  }
  if (pageSelfFallback) return pageSelfFallback;
  return { quizId: "mbti", typeCode: "--", alias: "—", keywords: [] };
}

function resolveSelfRecordForCompare(
  mutualRaw: unknown,
  pageSelfFallback: RecordResultPresentation | null,
): NormalizedSelfRecord | { id: string; result: { type: string }; answers: unknown[]; quizId?: SessionQuizId } | null {
  const sid = pickSelfTestId(mutualRaw);
  if (sid) {
    const rec = findSelfRecordById(sid);
    if (rec) return rec;
    const pres = resolveViewerSelfPresentation(mutualRaw, pageSelfFallback);
    return {
      id: sid,
      result: { type: pres.typeCode },
      answers: [],
      quizId: pres.quizId,
    };
  }
  return null;
}

/** 单列页兜底用页级自测；汇总页传 null 由每条 selfTestId 解析 */
export function normalizeMutualItem(
  raw: unknown,
  index: number,
  pageSelfFallback: RecordResultPresentation | null,
): MutualFriendRowVm {
  const r = raw as { id?: unknown; _id?: unknown };
  const idRaw = r.id ?? r._id ?? `idx-${index}`;
  const id = String(idRaw);
  const friendPres = buildRecordResultPresentation(raw);
  const viewerPres = resolveViewerSelfPresentation(raw, pageSelfFallback);
  const selfRawForCompare =
    resolveSelfRecordForCompare(raw, pageSelfFallback) || {
      result: { type: viewerPres.typeCode },
      quizId: viewerPres.quizId,
    };
  const same = mutualResultsMatch(selfRawForCompare, raw);
  const nick = pickFriendField(raw, "friendNickName", "friend_nick_name");
  const avatar = publicAvatarUrl(pickFriendField(raw, "friendAvatarUrl", "friend_avatar_url"));
  return {
    id,
    friendNickName: truncateName(nick || `朋友${index + 1}`),
    friendAvatarUrl: avatar,
    friendAvatarLoadFailed: false,
    friendType: friendPres.typeCode,
    friendAlias: friendPres.alias,
    viewerSelfType: viewerPres.typeCode,
    viewerSelfAlias: viewerPres.alias,
    quizId: friendPres.quizId,
    timeText: formatMutualRowTime((raw as { createdAt?: unknown }).createdAt),
    chipText: same ? "结果一致" : "结果不同",
    chipSame: same,
    raw,
  };
}

/** @deprecated 保留旧名，供外部引用；返回展示用档位名而非 MBTI 四字母 */
export function selfTypeLettersFromFindRecord(rec: NormalizedSelfRecord | null): string {
  if (!rec) return "--";
  return buildRecordResultPresentation(rec).typeCode || "--";
}

export async function mergeAllMutualFromApi(quizId?: SessionQuizId): Promise<unknown[]> {
  const allRaw = minigameApp.records as NormalizedSelfRecord[];
  if (!Array.isArray(allRaw) || !allRaw.length) return [];
  const raw = quizId
    ? allRaw.filter((rec) => resolveRecordQuizId(rec) === quizId)
    : allRaw;
  if (!raw.length) return [];
  const results = await Promise.all(raw.map((rec) => mg.mgGetMutualResults(rec.id).catch(() => [])));
  const merged: unknown[] = [];
  results.forEach((list, idx) => {
    const arr = Array.isArray(list) ? list : [];
    const rec = raw[idx];
    if (rec) syncRecordMutualCounts(allRaw, rec.id, arr as { createdAt?: unknown }[]);
    merged.push(...arr);
  });
  minigameApp.records = [...allRaw];
  return quizId ? filterMutualListByQuizId(merged, quizId) : merged;
}

export function pickSelfTestIdExported(mutualRaw: unknown): string {
  return pickSelfTestId(mutualRaw);
}

export function resolveCompareSelfRecord(
  mutualRaw: unknown,
  pageSelfFallback: RecordResultPresentation | null,
): NormalizedSelfRecord | { id: string; result: { type: string }; answers: unknown[]; quizId?: SessionQuizId } | null {
  return resolveSelfRecordForCompare(mutualRaw, pageSelfFallback);
}
