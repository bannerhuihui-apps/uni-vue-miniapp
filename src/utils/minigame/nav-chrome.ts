/** 首页右上角设置按钮 top（px）：落在微信胶囊下方，避免与「···」重叠 */
export function readTopRightGearTopPx(): number {
  const gapPx = 10;
  try {
    const rect = uni.getMenuButtonBoundingClientRect();
    if (rect && typeof rect.bottom === "number" && rect.bottom > 0) {
      return rect.bottom + gapPx;
    }
  } catch {
    /* H5 / 非微信 */
  }
  try {
    const w = uni.getWindowInfo();
    const statusBar = typeof w.statusBarHeight === "number" ? w.statusBarHeight : 22;
    return statusBar + 44 + gapPx;
  } catch {
    return 90;
  }
}
