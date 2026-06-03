<template>
  <view class="page z-set">
    <image class="layer-bg" :src="IMG_QUESTION_BG" mode="aspectFill" aria-hidden="true" />
    <view class="mask"></view>

    <view class="stack">
      <ZhiwoNavBar title="设置" title-color="rgba(0,0,0,0.78)" />
      <scroll-view scroll-y enhanced class="main-scroll" :show-scrollbar="false">
        <view class="qy-scroll-fill" :style="{ minHeight: scrollInnerMinPx + 'px' }">
          <view class="qy-scroll-fill__main">
            <view class="set-card">
              <text class="set-card-title">清除本地缓存</text>
              <text class="set-card-desc">仅清理当前设备上的字体缓存和本地存储，不会删除云端测试记录。</text>
              <view class="set-btn-clear tap" @tap="onClearCache">清除本地缓存</view>
            </view>
            <view class="set-card set-card-spaced">
              <text class="set-card-title">清除云端测试数据</text>
              <text class="set-card-desc">删除服务器上您的全部自测与互测结果，以及您发出的测评邀请。头像与昵称保留。</text>
              <view class="set-btn-wipe tap" @tap="onClearCloudTestData">清除云端测试数据</view>
            </view>
            <view class="scroll-pad"></view>
          </view>
          <view class="qy-scroll-fill__grow"></view>
        </view>
      </scroll-view>

      <view class="bottom safe-bottom">
        <view class="btn-home tap" @tap="goHome">返回首页</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onReady, onShow } from "@dcloudio/uni-app";
import { IMG_QUESTION_BG } from "@/config/static-images";
import ZhiwoNavBar from "@/components/ZhiwoNavBar.vue";
import * as mg from "@/api/minigame";
import { minigameApp } from "@/state/minigame-app";
import { getApiSource, loadRemoteRecords, notifyPagesAuthResolved, performLogin } from "@/utils/minigame/session";
import { reLaunchIndexHome } from "@/utils/minigame/index-home";
import { getAppId } from "@/utils/minigame/app-env";
import { scrollInnerMinHeightPx } from "@/utils/minigame/scroll-layout";

const FONT_CACHE_FILE = "qingning-rounded.ttf";
const scrollInnerMinPx = ref(480);

/** 固底「返回首页」+ 安全区 + 列表底留白 */
function refreshScrollLayout() {
  const px = scrollInnerMinHeightPx({
    bottomRpx: 16 + 116 + 24 + 48,
    aboveScrollRpx: 0,
  });
  if (scrollInnerMinPx.value !== px) scrollInnerMinPx.value = px;
}

onReady(refreshScrollLayout);

onShow(() => {
  refreshScrollLayout();
});

function resetAfterLocalClear() {
  minigameApp.userId = "";
  minigameApp.profile = null;
  minigameApp.records = [];
  minigameApp.invite = null;
  minigameApp.pendingInviteId = "";
  minigameApp.pendingQuizPersist = null;
  minigameApp.currentResult = null;
  minigameApp.lastQuizContext = { mode: "self", inviteId: "", quizId: "mbti" };
  minigameApp.sessionQuizId = "mbti";
  minigameApp.compareContext = null;
  minigameApp.currentSelfRecord = null;
  minigameApp.mutualResultsCache = {};
  minigameApp.mutualAllList = null;
  minigameApp.showMutualSelfResult = true;
  minigameApp.authStatus = "loading";
  minigameApp.authError = "";
}

function resetCachesAfterCloudWipe() {
  minigameApp.records = [];
  minigameApp.invite = null;
  minigameApp.pendingInviteId = "";
  minigameApp.pendingQuizPersist = null;
  minigameApp.currentResult = null;
  minigameApp.lastQuizContext = { mode: "self", inviteId: "", quizId: "mbti" };
  minigameApp.sessionQuizId = "mbti";
  minigameApp.compareContext = null;
  minigameApp.currentSelfRecord = null;
  minigameApp.mutualResultsCache = {};
  minigameApp.mutualAllList = null;
  minigameApp.showMutualSelfResult = true;
}

function onClearCache() {
  uni.showModal({
    title: "清除本地缓存",
    content: "仅清理当前设备上的字体缓存和本地存储，不会删除云端测试记录。是否继续？",
    confirmText: "清除",
    cancelText: "取消",
    success: (res) => {
      if (res.confirm) doClearCache();
    },
  });
}

function doClearCache(): void {
  let cleared = false;
  try {
    uni.clearStorageSync();
    cleared = true;
  } catch {
    /* ignore */
  }
  resetAfterLocalClear();
  const fs = uni.getFileSystemManager();
  const env = (uni as { env?: { USER_DATA_PATH?: string } }).env?.USER_DATA_PATH;

  const finish = () => {
    uni.showToast({ title: cleared ? "本地缓存已清除" : "已重置会话", icon: "none" });
    performLogin(false).catch(() => {});
  };

  if (fs && env) {
    fs.unlink({
      filePath: `${env}/${FONT_CACHE_FILE}`,
      complete: finish,
      fail: finish,
    });
  } else {
    finish();
  }
}

function onClearCloudTestData() {
  uni.showModal({
    title: "清除云端测试数据",
    content:
      "将永久删除服务器上您的全部自测、互测记录及您发出的测评邀请（不可恢复）。头像与昵称不受影响。是否继续？",
    confirmText: "清除",
    cancelText: "取消",
    success: (res) => {
      if (res.confirm) doClearCloudTestData();
    },
  });
}

function doClearCloudTestData(): void {
  const userId = minigameApp.userId;
  if (!userId) {
    uni.showToast({ title: "请先完成登录", icon: "none" });
    return;
  }
  uni.showLoading({ title: "正在清除…", mask: true });
  mg.mgWipeUserTestData({ userId, appId: getAppId(), source: getApiSource() })
    .then(() => {
      resetCachesAfterCloudWipe();
      return loadRemoteRecords(userId);
    })
    .then(() => {
      uni.hideLoading();
      uni.showToast({ title: "云端数据已清除", icon: "success" });
      notifyPagesAuthResolved();
    })
    .catch((e: Error | undefined) => {
      uni.hideLoading();
      uni.showToast({ title: (e && e.message) || "清除失败", icon: "none" });
    });
}

function goHome() {
  reLaunchIndexHome();
}
</script>

<style lang="scss" scoped>
.z-set.page {
  position: relative;
  min-height: 100vh;
  height: 100vh;
  box-sizing: border-box;
}

.layer-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  z-index: 0;
  pointer-events: none;
}

.stack {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-sizing: border-box;
}

.main-scroll {
  flex: 1;
  min-height: 0;
  height: 0;
  padding: 24rpx 40rpx 0;
  box-sizing: border-box;
}

.qy-scroll-fill {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.qy-scroll-fill__main {
  flex-shrink: 0;
  width: 100%;
}

.qy-scroll-fill__grow {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
}

.set-card {
  background: rgba(255, 255, 255, 0.76);
  border-radius: 52rpx;
  border: 2rpx solid var(--qy-card-stroke);
  padding: 36rpx 36rpx 40rpx;
  box-shadow: var(--qy-card-shadow);
  box-sizing: border-box;
}

.set-card-title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  line-height: 1.35;
}

.set-card-desc {
  display: block;
  margin-top: 24rpx;
  font-size: 32rpx;
  line-height: 48rpx;
  color: var(--qy-text-mute);
}

.set-card-spaced {
  margin-top: 28rpx;
}

.set-btn-clear {
  margin-top: 48rpx;
  height: 104rpx;
  line-height: 104rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 44rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  background: rgba(255, 255, 255, 0.92);
  border: 2rpx solid rgba(224, 214, 182, 0.95);
  box-sizing: border-box;
}

.set-btn-wipe {
  margin-top: 48rpx;
  height: 104rpx;
  line-height: 104rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 44rpx;
  font-weight: 700;
  color: var(--qy-today-red);
  background: rgba(255, 255, 255, 0.92);
  border: 2rpx solid rgba(211, 47, 47, 0.45);
  box-sizing: border-box;
}

.scroll-pad {
  height: 48rpx;
}

.bottom {
  flex-shrink: 0;
  padding: 16rpx 40rpx 24rpx;
  box-sizing: border-box;
}

.safe-bottom {
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.btn-home {
  height: 116rpx;
  line-height: 116rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 48rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  background: var(--qy-lemon);
  border: 2rpx solid var(--qy-card-stroke);
  box-sizing: border-box;
}

.tap:active {
  opacity: 0.9;
}
</style>
