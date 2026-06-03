/**
 * 互测相关门槛（与 zhiwo/utils/mutual-view-gate.js 一致）
 *
 * MIN_MUTUAL_EVALUATIONS_FOR_VIEW：进入「全部汇总」页所需的累计互测条数下限（0=不限制）。
 *
 * MIN_FRIEND_MUTUAL_FOR_DIM：「维度倾向」区块开放条件。
 * - 汇总拉取的累计互测记录数（merged 条数）小于该值 → 显示遮罩 + 遮罩文案。
 * - 大于等于该值 → 不显示遮罩，维度倾向完整展示。
 */
export const MIN_MUTUAL_EVALUATIONS_FOR_VIEW = 0;

export const MIN_FRIEND_MUTUAL_FOR_DIM = 5;

export const MUTUAL_TOO_FEW_MSG =
  "对您进行的评价，不到10份，无法查看此结果。请继续邀请朋友，对您进行评价。";
