/**
 * 微信流量主广告位。
 *
 * 答题页顶部使用微信「原生模板广告」时，填微信后台生成的 adunit-xxx。
 * 也可以通过构建环境变量 VITE_QY_QUIZ_NATIVE_AD_UNIT_ID 注入，便于不同环境切换。
 */
export const QUIZ_NATIVE_AD_UNIT_ID =
  String(import.meta.env.VITE_QY_QUIZ_NATIVE_AD_UNIT_ID || "").trim() ||
  "adunit-c29f8734b8a1729e";

/**
 * 横幅「单图」预估高度（rpx）。进入页先占位，避免广告异步撑开导致内容下跳。
 * 若换了更高的模板，可把这个值略调大。
 */
export const QUIZ_NATIVE_AD_RESERVE_RPX = 152;

