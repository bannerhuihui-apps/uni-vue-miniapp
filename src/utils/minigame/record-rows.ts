/** 列表 UI 行结构（字段名对齐 zhiwo WXML bind） */
import type { NormalizedSelfRecord } from "@/utils/minigame/normalize-records";
import type { SessionQuizId } from "@/state/minigame-app";
import { buildDarknessResultPresentation } from "@/data/quiz-darkness-result-tiers";
import { buildCrushResultPresentation } from "@/data/quiz-crush-result-tiers";
import { buildPeachResultPresentation } from "@/data/quiz-peach-result-tiers";
import { buildBirthColorResultPresentation } from "@/data/quiz-birth-color-result-tiers";

import MBTI_LIST from "@/data/mbti-types";

interface MbtiMeta {
  type: string;
  alias?: string;
  keywords?: string[];
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatRecordTime(createdAt: unknown): string {
  const t =
    typeof createdAt === "number"
      ? createdAt
      : typeof createdAt === "string"
        ? Date.parse(createdAt)
        : NaN;
  if (!Number.isFinite(t)) return "";
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getTypeMeta(typeCode: string): MbtiMeta | null {
  if (!typeCode) return null;
  const arr = MBTI_LIST as MbtiMeta[];
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i]?.type === typeCode) return arr[i];
  }
  return null;
}

function recordQuizLabel(quizId: SessionQuizId): string {
  if (quizId === "darkness_trend") return "黑化趋势";
  if (quizId === "peach_blossom") return "桃花体质";
  if (quizId === "crush_index") return "花痴指数";
  if (quizId === "birth_color") return "本命颜色";
  return "";
}

function scoredKeywordsFromCounts(
  quizId: SessionQuizId,
  counts: Record<string, number> | undefined,
): string[] {
  if (!counts) return [];
  if (quizId === "peach_blossom" && typeof counts["桃花分值"] === "number") {
    return [`桃花 ${counts["桃花分值"]} 分`];
  }
  if (quizId === "crush_index" && typeof counts["花痴分值"] === "number") {
    return [`花痴 ${counts["花痴分值"]} 分`];
  }
  if (quizId === "birth_color" && typeof counts["颜色分值"] === "number") {
    return [`颜色 ${counts["颜色分值"]} 分`];
  }
  return [];
}

function tierPresentationForRecord(quizId: SessionQuizId, rec: NormalizedSelfRecord) {
  if (quizId === "darkness_trend") return buildDarknessResultPresentation(rec.result);
  if (quizId === "crush_index") return buildCrushResultPresentation(rec.result);
  if (quizId === "peach_blossom") return buildPeachResultPresentation(rec.result);
  if (quizId === "birth_color") return buildBirthColorResultPresentation(rec.result);
  return null;
}

function recordRowAlias(type: string, quizId: SessionQuizId, rec?: NormalizedSelfRecord): string {
  if (rec) {
    const view = tierPresentationForRecord(quizId, rec);
    if (view) return view.alias;
  }
  if (quizId === "mbti") {
    const meta = getTypeMeta(type);
    return meta?.alias || "MBTI 结果";
  }
  return recordQuizLabel(quizId) || "趣味结果";
}

function recordRowTypeCode(type: string, quizId: SessionQuizId, rec: NormalizedSelfRecord): string {
  const view = tierPresentationForRecord(quizId, rec);
  if (view) return view.typeCode;
  return type || "--";
}

function recordRowKeywords(rec: NormalizedSelfRecord, type: string, quizId: SessionQuizId): string[] {
  if (quizId === "mbti") {
    const meta = getTypeMeta(type);
    return (meta?.keywords || []).slice(0, 3);
  }
  if (
    quizId === "darkness_trend" ||
    quizId === "crush_index" ||
    quizId === "peach_blossom" ||
    quizId === "birth_color"
  ) {
    const view = tierPresentationForRecord(quizId, rec);
    if (view) return view.keywords.slice(0, 3);
  }
  const r = rec.result as { counts?: Record<string, number> } | null | undefined;
  const fromCounts = scoredKeywordsFromCounts(quizId, r?.counts);
  if (fromCounts.length) return fromCounts.slice(0, 3);
  return [];
}

export interface UiRecordRow {
  id: string;
  typeCode: string;
  alias: string;
  keywords: string[];
  mutualTotal: number;
  todayCount: number;
  showToday: boolean;
  timeText: string;
  quizId: SessionQuizId;
}

function resultType(rec: NormalizedSelfRecord): string {
  const r = rec.result as { type?: string } | undefined;
  return typeof r?.type === "string" ? r.type : "";
}

export function normalizedToRecordUiRows(records: NormalizedSelfRecord[]): UiRecordRow[] {
  return records.map((rec) => {
    const type = resultType(rec);
    const quizId = rec.quizId ?? "mbti";
    return {
      id: rec.id,
      typeCode: recordRowTypeCode(type, quizId, rec),
      alias: recordRowAlias(type, quizId, rec),
      keywords: recordRowKeywords(rec, type, quizId),
      mutualTotal: typeof rec.mutualCount === "number" ? rec.mutualCount : 0,
      todayCount: typeof rec.todayMutualCount === "number" ? rec.todayMutualCount : 0,
      showToday: (typeof rec.todayMutualCount === "number" ? rec.todayMutualCount : 0) > 0,
      timeText: formatRecordTime(rec.createdAt),
      quizId,
    };
  });
}

export interface UiInviteRow extends UiRecordRow {
  inviteKey: string;
}

export function totalMutualFriendsCount(records: unknown[]): number {
  if (!Array.isArray(records)) return 0;
  let n = 0;
  for (let i = 0; i < records.length; i += 1) {
    const c = (records[i] as { mutualCount?: number }).mutualCount;
    if (typeof c === "number") n += c;
  }
  return n;
}
export function normalizedToInviteUiRows(records: NormalizedSelfRecord[]): UiInviteRow[] {
  const selfList = records.filter((r) => {
    if (r.mode === "mutual") return false;
    return !!resultType(r);
  });
  return selfList.map((rec) => ({
    ...normalizedToRecordUiRows([rec])[0]!,
    inviteKey: rec.inviteId || rec.id,
  }));
}
