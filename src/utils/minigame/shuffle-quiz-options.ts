import type { QuizQuestion } from "@/state/minigame-app";

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

/** 随机打乱每题选项的展示顺序；`letter` 不变，计分仍按原 A/B/C/D（或 MBTI 字母）key。 */
export function shuffleQuizQuestionOptions(questions: QuizQuestion[]): QuizQuestion[] {
  return questions.map((q) => {
    if (!Array.isArray(q.options) || q.options.length < 2) return q;
    return {
      ...q,
      options: shuffleInPlace(q.options.slice()),
    };
  });
}
