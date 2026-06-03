import { getWindowMetrics, rpxToPx } from "@/utils/minigame/scroll-layout";

/** 原 CSS `--index-lift`，整体向上微调时改此值（rpx） */
export const INDEX_HERO_LIFT_RPX = 152;

/** 对应原 hero `calc(51vh - 40rpx - lift)` 中的固定偏移 */
const INDEX_HERO_OFFSET_RPX = 40;

/** 原 `51vh` 比例 */
const INDEX_HERO_TOP_RATIO = 0.51;

const INDEX_FOOTER_BOTTOM_RPX = 72;

export type IndexHomeLayout = {
  windowHeightPx: number;
  safeTopPx: number;
  safeBottomPx: number;
  heroMarginTopPx: number;
  footerPaddingBottomPx: number;
};

function readSafeInsets(): { safeTopPx: number; safeBottomPx: number } {
  type Win = {
    statusBarHeight?: number;
    screenHeight?: number;
    safeArea?: { top: number; bottom: number };
    safeAreaInsets?: { top?: number; bottom?: number };
  };
  try {
    const w = uni.getWindowInfo() as Win;
    const safeTopPx =
      w.safeAreaInsets?.top ?? w.statusBarHeight ?? (w.safeArea != null ? w.safeArea.top : 0);
    const safeBottomPx =
      w.safeAreaInsets?.bottom ??
      (w.safeArea != null && w.screenHeight != null
        ? Math.max(0, w.screenHeight - w.safeArea.bottom)
        : 0);
    return { safeTopPx, safeBottomPx };
  } catch {
    return { safeTopPx: 0, safeBottomPx: 0 };
  }
}

/** 首页布局：用 windowHeight + safeArea（px）替代 vh/env，真机与开发者工具更一致 */
export function readIndexHomeLayout(liftRpx = INDEX_HERO_LIFT_RPX): IndexHomeLayout {
  const { windowHeight, windowWidth } = getWindowMetrics();
  const { safeTopPx, safeBottomPx } = readSafeInsets();

  const liftPx = rpxToPx(INDEX_HERO_OFFSET_RPX + liftRpx, windowWidth);
  const minHeroMarginPx = rpxToPx(8, windowWidth);
  // 对应原 `padding-top: safeTop` + `margin-top: calc(51vh - offset - lift)`，vh 用 windowHeight 替代
  const heroMarginTopPx = Math.max(
    Math.round(windowHeight * INDEX_HERO_TOP_RATIO - liftPx),
    minHeroMarginPx,
  );

  return {
    windowHeightPx: windowHeight,
    safeTopPx,
    safeBottomPx,
    heroMarginTopPx,
    footerPaddingBottomPx: rpxToPx(INDEX_FOOTER_BOTTOM_RPX, windowWidth) + safeBottomPx,
  };
}
