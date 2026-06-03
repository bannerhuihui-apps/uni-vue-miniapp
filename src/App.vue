<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";

import {
  FONT_FAMILY_QINGNING,
  getQingningFontUrlForMp,
} from "@/constants/zhiwo-font";
import mutualTestQuestionsSrc from "@/data/mutual-test-questions";
import selfTestQuestionsSrc from "@/data/self-test-questions";
import { minigameApp } from "@/state/minigame-app";
import { performLogin } from "@/utils/minigame/session";

/** 与原 zhiwo/app.js initCustomFont 对齐：小程序动态注册字体后再由全局 WXSS 使用 family 名 */
function initQingningFontMp() {
  // #ifndef MP-WEIXIN
  return;
  // #endif
  // #ifdef MP-WEIXIN
  const url = getQingningFontUrlForMp();
  uni.loadFontFace({
    global: true,
    family: FONT_FAMILY_QINGNING,
    source: `url("${url}")`,
    success() {
      /* 加载成功可无日志；如需排查可解开 */
      // console.log("[font] QingningRounded OK");
    },
    fail(err) {
      console.warn("[font] QingningRounded load failed, UI 将使用系统后备字体", err);
    },
  });
  // #endif
}

onLaunch(() => {
  initQingningFontMp();
  /** zhiwo/app.js — 题库进包，quiz 直接使用 */
  const s = [...selfTestQuestionsSrc];
  const mutualArr = [...mutualTestQuestionsSrc];
  const mRaw = mutualArr.length ? mutualArr : [...s];
  minigameApp.selfTestQuestions = s;
  minigameApp.mutualTestQuestions = mRaw.length ? mRaw : [...s];

  performLogin(false).catch(() => {});

  console.log("App Launch");
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style lang="scss">
@use "@/styles/zhiwo-theme.scss";

/**
 * H5：@font-face；URL 与 src/constants/zhiwo-font.ts 中 Remote 一致；
 * 若跨域失败，可把 qingning-rounded.ttf 放到 static/fonts/ 再改为本地路径。
 */
/* #ifdef H5 */
@font-face {
  font-family: "QingningRounded";
  src: url("https://game.jyiai.com/static/fonts/qingning-rounded.ttf")
    format("truetype");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
/* #endif */

/* H5：不显示纵向/横向滚动条，仍可拖动/触控滚动；
 * 微信小程序：官方说明 show-scrollbar 在 WebView 下须与 enhanced 同时使用才生效，见 scroll-view 文档 */
/* #ifdef H5 */
* {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
*::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
}
/* #endif */
</style>
