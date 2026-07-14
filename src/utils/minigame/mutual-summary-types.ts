import type { SessionQuizId } from "@/state/minigame-app";

export interface DimRowVm {
  leftLabel: string;
  rightLabel: string;
  leftPercent: number;
  rightPercent: number;
  splitHeavy: "even" | "left" | "right";
  grad: string;
}

export interface PillCellVm {
  leftLabel: string;
  leftCount: number;
  rightLabel: string;
  rightCount: number;
  pillTone: string;
}

/** 趣味测评 2×2 四象格 */
export interface QuadCellVm {
  label: string;
  count: number;
  pillTone: string;
}

export interface MutualSummaryVm {
  quizId: SessionQuizId;
  isScoredQuiz: boolean;
  /** 趣味测评汇总主标题（档位名） */
  scoredHeadline: string;
  hasSummaryData: boolean;
  composite: string;
  compositeParts: { text: string; disputed: boolean }[];
  showTfControversyHint: boolean;
  aliasTop: string;
  topTypesText: string;
  showTopTypes: boolean;
  pillRows: {
    leftLabel: string;
    leftCount: number;
    rightLabel: string;
    rightCount: number;
  }[];
  pillPairs: PillCellVm[][];
  /** 趣味测评四象格；MBTI 为空数组 */
  quadGrid: QuadCellVm[][];
  dimRows: DimRowVm[];
  totalFriends: number;
  /** 四象区块标题（MBTI / 趣味测评文案不同） */
  quadBlockTitle: string;
  quadBlockSub: string;
}
