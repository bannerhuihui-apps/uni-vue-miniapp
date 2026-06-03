/**
 * 「本命颜色」计分结算（题干构建与桃花同源：见 `buildPeachQuizQuestions`）。
 * @see quiz-birth-color.ts
 */

import type { PeachBlossomQuestionItem } from "@/data/quiz-scored-types";
import { BIRTH_COLOR_RESULT_TIERS, resolveBirthColorResultTier } from "@/data/quiz-birth-color-result-tiers";

function scoreForLetter(row: PeachBlossomQuestionItem, letter: string): number {
  const k = String(letter || "")
    .trim()
    .toUpperCase() as "A" | "B" | "C" | "D";
  const hit = row.options.find((o) => o.key === k);
  return typeof hit?.score === "number" ? hit.score : 0;
}

/** 10 题，每题 1–4 分，总分 10–40；档位与「结果说明」sheet 一致。 */
export function settleBirthColorAnswers(
  answers: string[],
  rows: PeachBlossomQuestionItem[],
): { type: string; counts: Record<string, number> } {
  let sum = 0;
  for (let i = 0; i < rows.length; i++) {
    sum += scoreForLetter(rows[i], answers[i] ?? "");
  }

  const tier = resolveBirthColorResultTier(sum);

  return {
    type: tier.typeLabel,
    counts: { 颜色分值: sum },
  };
}

export function getBirthColorTierBlurb(typeLabel: string): string {
  const m = /本命颜色·(.+)$/.exec(typeLabel);
  const key = m?.[1] || "";
  const tier = BIRTH_COLOR_RESULT_TIERS.find((t) => t.title === key);
  if (tier) return tier.summary.replace(/^[^！!]+[！!]/, "");
  return "";
}
