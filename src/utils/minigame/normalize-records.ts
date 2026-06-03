/** zhiwo/utils/normalize-records.js */
import type { SessionQuizId } from "@/state/minigame-app";
import { resolveRecordQuizId } from "@/utils/minigame/quiz-id";

export { coerceRecordQuizId, inferQuizIdFromResult } from "@/utils/minigame/quiz-id";

export interface NormalizedSelfRecord {
  id: string;
  mode: string;
  createdAt: number | undefined;
  answers: unknown[];
  result: unknown;
  mutualCount: number;
  todayMutualCount: number;
  inviteId?: string;
  /** 与本场自测套题对齐；缺失时按 MBTI 处理 */
  quizId?: SessionQuizId;
}

export function normalizeSelfRecords(list: unknown): NormalizedSelfRecord[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((item): item is Record<string, unknown> => !!item && (item as { mode?: string }).mode !== "mutual")
    .map((item) => ({
      id: String(item.selfTestId ?? item.id ?? ""),
      mode: (item.mode as string) || "self",
      createdAt: item.createdAt as number | undefined,
      answers: Array.isArray(item.answers) ? item.answers : [],
      result: item.result ?? null,
      mutualCount: typeof item.mutualCount === "number" ? item.mutualCount : 0,
      todayMutualCount: typeof item.todayMutualCount === "number" ? item.todayMutualCount : 0,
      inviteId: item.inviteId as string | undefined,
      quizId: resolveRecordQuizId(item),
    }));
}
