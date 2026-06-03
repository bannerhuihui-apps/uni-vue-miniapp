/**
 * 非 MBTI 趣味测试题 — 与 `self-test-questions`(MBTI) 分库。
 * 题干同时包含自测与朋友视角两套文案；作答时按视角取 text / 选项文案与计分权重。
 */

/** 与后台约定：稳定字符串，勿随意改 */
export const DARKNESS_TREND_QUIZ_ID = "darkness_trend" as const;
export const PEACH_BLOSSOM_QUIZ_ID = "peach_blossom" as const;
export const CRUSH_INDEX_QUIZ_ID = "crush_index" as const;
export const BIRTH_COLOR_QUIZ_ID = "birth_color" as const;

/** Excel/规则迭代时递增，入库与计分用 */
export const SCORED_QUIZ_SCHEMA_V1 = "v1" as const;

export type ScoredQuizPerspective = "self" | "friend";

export interface DarknessTrendOption {
  key: "A" | "B" | "C" | "D";
  textSelf: string;
  textFriend: string;
  /** 自测选项对应的黑化值加成 */
  darknessDeltaSelf: number;
  /** 朋友视角选项对应的黑化值加成 */
  darknessDeltaFriend: number;
}

/** 黑化趋势：10 题，每题 4 选项，双视角题干 */
export interface DarknessTrendQuestionItem {
  id: string;
  textSelf: string;
  textFriend: string;
  options: DarknessTrendOption[];
}

export interface PeachBlossomOption {
  key: "A" | "B" | "C" | "D";
  textSelf: string;
  textFriend: string;
  /** 该选项得分（表中 1–4） */
  score: number;
}

/** 桃花体质：10 题，每题 4 选项，双视角题干 */
export interface PeachBlossomQuestionItem {
  id: string;
  textSelf: string;
  textFriend: string;
  options: PeachBlossomOption[];
}
