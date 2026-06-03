/**
 * 「桃花体质」题库 → 每题一道 `QuizQuestion`，每题 **4** 个选项（与表格一致）。
 * @see quiz-peach-blossom.ts
 */

import type { PeachBlossomQuestionItem } from "@/data/quiz-scored-types";
import { resolvePeachResultTier } from "@/data/quiz-peach-result-tiers";
import type { QuizQuestion } from "@/state/minigame-app";
import { stripOptionLead } from "@/utils/minigame/darkness-quiz-adapter";

function stripStemNumber(s: string): string {
  return s.replace(/^\d+\.\s*/, "").trim();
}

export function buildPeachQuizQuestions(
  rows: PeachBlossomQuestionItem[],
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

function scoreForLetter(row: PeachBlossomQuestionItem, letter: string): number {
  const k = String(letter || "")
    .trim()
    .toUpperCase() as "A" | "B" | "C" | "D";
  const hit = row.options.find((o) => o.key === k);
  return typeof hit?.score === "number" ? hit.score : 0;
}

/** answers 与题顺序一致；每题为 A/B/C/D 之一。总分区间约 10–40（每题 1–4 分）。 */
export function settlePeachBlossomAnswers(
  answers: string[],
  rows: PeachBlossomQuestionItem[],
): { type: string; counts: Record<string, number> } {
  let sum = 0;
  for (let i = 0; i < rows.length; i++) {
    sum += scoreForLetter(rows[i], answers[i] ?? "");
  }

  const tier = resolvePeachResultTier(sum);

  return {
    type: tier.typeLabel,
    counts: { 桃花分值: sum },
  };
}
