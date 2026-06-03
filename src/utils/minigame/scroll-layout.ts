/** zhiwo/utils/scroll-layout.js */
export function rpxToPx(rpx: number, windowWidth: number): number {
  const w = windowWidth || 375;
  return (rpx * w) / 750;
}

export function getWindowMetrics(): {
  windowHeight: number;
  windowWidth: number;
  statusBarHeight: number;
  safeBottom: number;
} {
  type Win = {
    windowHeight?: number;
    windowWidth?: number;
    screenHeight?: number;
    screenWidth?: number;
    statusBarHeight?: number;
    safeArea?: { top: number; bottom: number };
  };
  const u = uni as { getWindowInfo?: () => Win; getSystemInfoSync?: () => Win };
  const w = typeof u.getWindowInfo === "function" ? u.getWindowInfo() : u.getSystemInfoSync?.() ?? {};
  const windowHeight = w.windowHeight ?? w.screenHeight ?? 667;
  const windowWidth = w.windowWidth ?? w.screenWidth ?? 375;
  const statusBarHeight =
    w.statusBarHeight != null ? w.statusBarHeight : w.safeArea != null ? w.safeArea.top : 20;
  const safeBottom =
    w.safeArea != null && w.screenHeight != null ? Math.max(0, w.screenHeight - w.safeArea.bottom) : 0;
  return { windowHeight, windowWidth, statusBarHeight, safeBottom };
}

export function scrollInnerMinHeightPx(opts: {
  bottomRpx: number;
  aboveScrollRpx?: number;
  navContentPx?: number;
  extraPx?: number;
  includeSafeBottom?: boolean;
}): number {
  const bottomRpx = opts.bottomRpx;
  const aboveScrollRpx = opts.aboveScrollRpx ?? 0;
  const navContentPx = opts.navContentPx ?? 44;
  const extraPx = opts.extraPx ?? 8;
  const includeSafeBottom = opts.includeSafeBottom !== false;

  const { windowHeight, windowWidth, statusBarHeight, safeBottom } = getWindowMetrics();
  const navBarPx = navContentPx + statusBarHeight;
  const bottomPx = rpxToPx(bottomRpx, windowWidth) + (includeSafeBottom ? safeBottom : 0);
  const abovePx = rpxToPx(aboveScrollRpx, windowWidth);
  return Math.max(Math.floor(windowHeight - navBarPx - bottomPx - abovePx - extraPx), 120);
}
