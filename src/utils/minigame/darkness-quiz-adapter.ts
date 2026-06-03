/**
 * 「黑化趋势」题库 → 每题一道 `QuizQuestion`，含 **4** 个选项（与表格一致）。
 * @see quiz-darkness-trend.ts
 */

import type { DarknessTrendQuestionItem } from "@/data/quiz-scored-types";
import { resolveDarknessResultTier } from "@/data/quiz-darkness-result-tiers";
import type { QuizQuestion } from "@/state/minigame-app";

function stripStemNumber(s: string): string {
  return s.replace(/^\d+\.\s*/, "").trim();
}

/** 去掉 "A. " 前缀 */
export function stripOptionLead(s: string): string {
  return s.replace(/^[A-Z]\.\s*/, "").trim();
}

export function buildDarknessQuizQuestions(
  rows: DarknessTrendQuestionItem[],
  perspective: "self" | "friend",
): QuizQuestion[] {
  return rows.map((row) => {
    const stem =
      perspective === "self"
        ? stripStemNumber(row.textSelf)
        : stripStemNumber(row.textFriend);

    const options =
      perspective === "self"
        ? row.options.map((o) => ({
            letter: o.key,
            text: stripOptionLead(o.textSelf),
          }))
        : row.options.map((o) => ({
            letter: o.key,
            text: stripOptionLead(o.textFriend),
          }));

    return {
      id: row.id,
      text: stem,
      options,
    };
  });
}

function deltaForLetter(
  row: DarknessTrendQuestionItem,
  letter: string,
  mutualPerspective: boolean,
): number {
  const k = String(letter || "")
    .trim()
    .toUpperCase() as "A" | "B" | "C" | "D";
  const hit = row.options.find((o) => o.key === k);
  if (!hit) return 0;
  return mutualPerspective ? hit.darknessDeltaFriend : hit.darknessDeltaSelf;
}

/** answers 长度与题库题数一致，每题为 A/B/C/D 之一 */
export function settleDarknessTrendAnswers(
  answers: string[],
  rows: DarknessTrendQuestionItem[],
  mutualPerspective: boolean,
): { type: string; counts: Record<string, number> } {
  let sum = 0;
  for (let i = 0; i < rows.length; i++) {
    sum += deltaForLetter(rows[i], answers[i] ?? "", mutualPerspective);
  }

  const tier = resolveDarknessResultTier(sum);

  return {
    type: tier.typeLabel,
    counts: { 黑化分值: sum },
  };
}
