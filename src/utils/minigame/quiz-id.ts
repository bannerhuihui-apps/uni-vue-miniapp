/** 与后端 MinigameQuizIdResolver 对齐：读记录时补全 quizId */
import type { SessionQuizId } from "@/state/minigame-app";

export function coerceRecordQuizId(raw: unknown): SessionQuizId {
  if (raw === "darkness_trend" || raw === "peach_blossom" || raw === "crush_index" || raw === "birth_color") {
    return raw;
  }
  return "mbti";
}

export function inferQuizIdFromResult(result: unknown): SessionQuizId {
  if (!result || typeof result !== "object") return "mbti";
  const r = result as { type?: string; counts?: Record<string, number> };
  const counts = r.counts;
  if (counts && typeof counts === "object") {
    if (typeof counts["黑化分值"] === "number") return "darkness_trend";
    if (typeof counts["桃花分值"] === "number") return "peach_blossom";
    if (typeof counts["花痴分值"] === "number") return "crush_index";
    if (typeof counts["颜色分值"] === "number") return "birth_color";
  }
  const type = typeof r.type === "string" ? r.type : "";
  if (type.startsWith("黑化趋势")) return "darkness_trend";
  if (type.startsWith("桃花体质")) return "peach_blossom";
  if (type.startsWith("花痴指数")) return "crush_index";
  if (type.startsWith("本命颜色")) return "birth_color";
  return "mbti";
}

export function resolveRecordQuizId(item: Record<string, unknown>): SessionQuizId {
  if (item.quizId != null && String(item.quizId).trim()) {
    return coerceRecordQuizId(item.quizId);
  }
  return inferQuizIdFromResult(item.result);
}

/** 是否存在指定套题的自测记录（含无 quizId 的历史 MBTI 推断） */
export function hasSelfTestRecordForQuiz(records: unknown, targetQuizId: SessionQuizId): boolean {
  if (!Array.isArray(records)) return false;
  return records.some((item) => {
    if (!item || typeof item !== "object") return false;
    const rec = item as Record<string, unknown>;
    if (rec.mode === "mutual") return false;
    const id = String(rec.id ?? rec.selfTestId ?? "").trim();
    if (!id) return false;
    return resolveRecordQuizId(rec) === targetQuizId;
  });
}
