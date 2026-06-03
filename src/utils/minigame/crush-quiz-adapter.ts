/**
 * 「花痴指数」计分结算（题干构建与桃花同源：见 `buildPeachQuizQuestions`）。
 * @see quiz-crush-index.ts
 */

import type { PeachBlossomQuestionItem } from "@/data/quiz-scored-types";
import { resolveCrushResultTier } from "@/data/quiz-crush-result-tiers";

function scoreForLetter(row: PeachBlossomQuestionItem, letter: string): number {
  const k = String(letter || "")
    .trim()
    .toUpperCase() as "A" | "B" | "C" | "D";
  const hit = row.options.find((o) => o.key === k);
  return typeof hit?.score === "number" ? hit.score : 0;
}

/** 10 题，每题 0–3 分，总分 0–30；档位与题库说明表一致。 */
export function settleCrushIndexAnswers(
  answers: string[],
  rows: PeachBlossomQuestionItem[],
): { type: string; counts: Record<string, number> } {
  let sum = 0;
  for (let i = 0; i < rows.length; i++) {
    sum += scoreForLetter(rows[i], answers[i] ?? "");
  }

  const tier = resolveCrushResultTier(sum);

  return {
    type: tier.typeLabel,
    counts: { 花痴分值: sum },
  };
}
