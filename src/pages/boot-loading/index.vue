<template>
  <view class="page boot-page">
    <image class="layer-bg" :src="IMG_INDEX_BG" mode="aspectFill" aria-hidden="true" />

    <ZhiwoBootLoading
      hint="正在准备内容…"
      @settings="goSettings"
    />

    <view v-if="showSkip" class="bottom-skip safe-skip tap" @tap="goHome">
      <text class="bottom-skip-txt">跳过，进入首页</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow, onUnload } from "@dcloudio/uni-app";
import ZhiwoBootLoading from "@/components/ZhiwoBootLoading.vue";
import { IMG_INDEX_BG } from "@/config/static-images";
import { minigameApp } from "@/state/minigame-app";
import { reLaunchIndexHome } from "@/utils/minigame/index-home";
import { isUiPreviewEnabled } from "@/utils/minigame/ui-preview";

/** 设置页演示入口保留跳过；正常冷启动登录完成后自动进首页 */
const showSkip = isUiPreviewEnabled();

function goSettings() {
  uni.navigateTo({ url: "/pages/settings/index" });
}

function goHome() {
  reLaunchIndexHome();
}

function tryLeaveBootScreen() {
  if (minigameApp.authStatus === "loading") return;
  reLaunchIndexHome(minigameApp.sessionQuizId);
}

function onAuthResolved() {
  tryLeaveBootScreen();
}

onShow(() => {
  tryLeaveBootScreen();
});

uni.$on("minigame-auth-resolved", onAuthResolved);

onUnload(() => {
  uni.$off("minigame-auth-resolved", onAuthResolved);
});
</script>

<style lang="scss" scoped>
.boot-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
  background: var(--qy-page-tint);
}

.layer-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.bottom-skip {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  padding: 24rpx 56rpx 0;
  padding-bottom: calc(36rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(36rpx + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

.bottom-skip-txt {
  display: block;
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: rgba(140, 134, 130, 0.95);
  text-decoration: underline;
  text-underline-offset: 10rpx;
}

.tap:active {
  opacity: 0.85;
}
</style>
