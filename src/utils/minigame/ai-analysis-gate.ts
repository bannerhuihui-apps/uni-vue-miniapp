/** AI 综合分析门槛（与后端 MinigameAiDataAggregator 一致） */
import type { SessionQuizId } from "@/state/minigame-app";

export const AI_REQUIRED_QUIZ_IDS: SessionQuizId[] = [
  "mbti",
  "darkness_trend",
  "peach_blossom",
  "crush_index",
  "birth_color",
];

export const MIN_MUTUAL_FOR_AI = 3;

export const AI_INELIGIBLE_MSG =
  "数据不足以支持AI分析，请确保每一种测试，都有测试记录，并且每种测试至少有3位朋友完成互测。";

export interface AiEligibilityMissingItem {
  quizId: string;
  label: string;
  needSelf: boolean;
  needMutual: number;
}

export interface AiEligibilityResult {
  eligible: boolean;
  message?: string;
  missing?: AiEligibilityMissingItem[];
}

export interface AiReportResult {
  content: string;
  cached?: boolean;
  generatedAt?: number;
  model?: string;
}
