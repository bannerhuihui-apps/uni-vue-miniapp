/** zhiwo pages/mutual-given-list mapRows — 服务端 MinigameMutualGivenItem */
import { publicAvatarUrl } from "@/utils/minigame/avatar-url";
import {
  buildRecordResultPresentation,
  mutualResultsMatch,
} from "@/utils/minigame/record-result-display";
import type { SessionQuizId } from "@/state/minigame-app";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatTime(createdAt: unknown): string {
  const t = typeof createdAt === "number" ? createdAt : Date.parse(String(createdAt ?? ""));
  if (!Number.isFinite(t)) return "";
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function truncateName(name: string): string {
  const s = (name || "").trim();
  if (!s) return "好友";
  return s.length > 5 ? `${s.slice(0, 5)}...` : s;
}

/** 列表展示：隐藏好友自测档位，本人互测结果仍正常展示 */
export const MUTUAL_GIVEN_PEER_RESULT_MASK = "**";

export function maskMutualGivenPeerResultDisplay(typeCode: string): string {
  const s = String(typeCode || "").trim();
  if (!s || s === "--") return s || "--";
  return MUTUAL_GIVEN_PEER_RESULT_MASK;
}

export interface MutualGivenRowVm {
  id: string;
  friendNickName: string;
  friendAvatarUrl: string;
  friendAvatarLoadFailed: boolean;
  peerSelfType: string;
  peerSelfAlias: string;
  chipText: string;
  chipSame: boolean;
  timeText: string;
  compareSelfType: string;
  compareMutualType: string;
  compareMutualAlias: string;
  compareSubjectNick: string;
  quizId: SessionQuizId;
}

/** 按套题筛选「我给好友的互测」列表 */
export function filterMutualGivenRowsByQuizId(
  rows: MutualGivenRowVm[],
  quizId: SessionQuizId,
): MutualGivenRowVm[] {
  return rows.filter((row) => row.quizId === quizId);
}

export function mapMutualGivenApiRows(list: unknown): MutualGivenRowVm[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      const it = item as {
        id?: string;
        quizId?: string;
        ownerNickName?: string;
        targetName?: string;
        ownerAvatarUrl?: string;
        ownerSelfResult?: { type?: string; counts?: Record<string, number> };
        result?: { type?: string; counts?: Record<string, number> };
        createdAt?: number;
      };
      const ownerNickPlain =
        `${it.ownerNickName || ""}`.trim() || `${it.targetName || ""}`.trim() || "好友";

      const mutualPres = buildRecordResultPresentation({
        result: it.result,
        quizId: it.quizId,
      });
      const ownerPres = buildRecordResultPresentation({
        result: it.ownerSelfResult,
        quizId: mutualPres.quizId,
      });
      const chipSame = mutualResultsMatch(
        { result: it.ownerSelfResult, quizId: mutualPres.quizId },
        { result: it.result },
      );

      return {
        id: String(it.id ?? ""),
        friendNickName: truncateName(ownerNickPlain),
        friendAvatarUrl: publicAvatarUrl(`${it.ownerAvatarUrl || ""}`.trim()),
        friendAvatarLoadFailed: false,
        peerSelfType: ownerPres.typeCode || "--",
        peerSelfAlias: ownerPres.alias,
        chipText: chipSame ? "结果一致" : "结果不同",
        chipSame,
        timeText: formatTime(it.createdAt),
        compareSelfType: ownerPres.typeCode || "--",
        compareMutualType: mutualPres.typeCode || "--",
        compareMutualAlias: mutualPres.alias,
        compareSubjectNick: ownerNickPlain,
        quizId: mutualPres.quizId,
      };
    })
    .filter((row) => row.id.trim().length > 0);
}
