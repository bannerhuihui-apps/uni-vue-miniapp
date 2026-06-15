<template>
  <view class="page z-ai">
    <image class="bg" :src="IMG_QUESTION_BG" mode="aspectFill" />
    <view class="mask"></view>

    <view class="stack">
      <ZhiwoNavBar title="AI 综合分析" title-color="rgba(0,0,0,0.78)" />

      <view v-if="loading" class="state-box">
        <view class="loading-panel">
          <view class="loading-spinner" aria-hidden="true">
            <view class="loading-spinner__ring"></view>
            <view class="loading-spinner__core">AI</view>
          </view>
          <text class="loading-panel__title">正在生成分析报告</text>
          <view class="loading-panel__track" aria-hidden="true">
            <view class="loading-panel__fill"></view>
          </view>
          <text class="loading-panel__hint">{{ loadingHint }}</text>
        </view>
      </view>

      <view v-else-if="errorMsg" class="state-box">
        <text class="state-text state-text--error">{{ errorMsg }}</text>
      </view>

      <template v-else>
        <scroll-view scroll-y enhanced class="scroll-area" :show-scrollbar="false">
          <view class="scroll-inner">
            <view class="card">
              <AiReportBody :content="content" />
            </view>
            <view class="scroll-tail-spacer"></view>
          </view>
        </scroll-view>

        <view class="footer">
          <view class="btn-copy tap" @tap="onCopy">一键复制</view>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { fetchAiReport } from "@/utils/minigame/ai-analysis-gate";
import { IMG_QUESTION_BG } from "@/config/static-images";
import ZhiwoNavBar from "@/components/ZhiwoNavBar.vue";
import AiReportBody from "@/components/AiReportBody.vue";
import { minigameApp } from "@/state/minigame-app";

const loading = ref(true);
const errorMsg = ref("");
const loadingHint = ref("首次生成约需 1～2 分钟，请稍候…");
const content = ref("");

let loadSeq = 0;

onShow(() => {
  void loadReport();
});

async function loadReport() {
  const seq = ++loadSeq;
  loading.value = true;
  errorMsg.value = "";
  content.value = "";

  const userId = minigameApp.userId;
  if (!userId || minigameApp.authStatus !== "success") {
    if (seq === loadSeq) {
      loading.value = false;
      errorMsg.value = "请先登录后再查看 AI 分析。";
    }
    return;
  }

  const prevHash = minigameApp.lastAiReportDataHash;
  if (prevHash) {
    loadingHint.value = "正在同步最新测试数据…";
  } else {
    loadingHint.value = "首次生成约需 1～2 分钟，请稍候…";
  }

  try {
    const res = await fetchAiReport(userId, (hint) => {
      if (seq === loadSeq) loadingHint.value = hint;
    });
    if (seq !== loadSeq) return;

    content.value = String(res?.content ?? "").trim();
    const nextHash = String(res?.dataHash ?? "").trim();
    if (nextHash) minigameApp.lastAiReportDataHash = nextHash;
    if (!content.value) {
      errorMsg.value = "报告内容为空，请稍后再试。";
    }
  } catch (e) {
    if (seq !== loadSeq) return;
    errorMsg.value = e instanceof Error ? e.message : "报告生成失败";
  } finally {
    if (seq === loadSeq) loading.value = false;
  }
}

function onCopy() {
  const t = content.value.trim();
  if (!t) return;
  uni.setClipboardData({
    data: t,
    success: () => uni.showToast({ title: "已复制", icon: "none" }),
  });
}
</script>

<style lang="scss" scoped>
.z-ai.page {
  position: relative;
  min-height: 100vh;
  height: 100vh;
  box-sizing: border-box;
  background: var(--qy-page-tint);
}

.bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.mask {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
}

.stack {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.state-box {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx 56rpx;
}

.loading-panel {
  width: 100%;
  max-width: 560rpx;
  padding: 48rpx 40rpx 44rpx;
  box-sizing: border-box;
  text-align: center;
  background: rgba(255, 255, 255, 0.78);
  border-radius: 48rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 12rpx 40rpx rgba(120, 100, 60, 0.12);
}

.loading-spinner {
  position: relative;
  width: 128rpx;
  height: 128rpx;
  margin: 0 auto 32rpx;
}

.loading-spinner__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 6rpx solid rgba(213, 241, 228, 0.55);
  border-top-color: rgba(212, 168, 75, 0.95);
  border-right-color: rgba(180, 220, 200, 0.85);
  animation: ai-spin 1.1s linear infinite;
}

.loading-spinner__core {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 72rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 50%;
  font-size: 28rpx;
  font-weight: 800;
  color: rgba(100, 78, 48, 0.9);
  background: linear-gradient(135deg, rgba(255, 244, 210, 0.96), rgba(213, 241, 228, 0.92));
  box-shadow: inset 0 2rpx 8rpx rgba(255, 255, 255, 0.8);
}

.loading-panel__title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 1.4;
  color: rgba(72, 62, 52, 0.94);
  margin-bottom: 28rpx;
}

.loading-panel__track {
  height: 16rpx;
  border-radius: 999rpx;
  background: rgba(240, 235, 225, 0.9);
  overflow: hidden;
}

.loading-panel__fill {
  height: 100%;
  width: 40%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, rgba(213, 241, 228, 0.98), rgba(245, 215, 110, 0.98));
  animation: ai-loading-bar 1.6s ease-in-out infinite alternate;
}

.loading-panel__hint {
  display: block;
  margin-top: 28rpx;
  font-size: 26rpx;
  line-height: 1.55;
  color: var(--qy-text-mute);
}

@keyframes ai-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes ai-loading-bar {
  0% {
    width: 28%;
    opacity: 0.85;
  }
  100% {
    width: 88%;
    opacity: 1;
  }
}

.state-text {
  font-size: 34rpx;
  line-height: 1.5;
  color: var(--qy-text-mute);
  text-align: center;
}

.state-text--error {
  color: rgba(160, 80, 60, 0.92);
}

.scroll-area {
  flex: 1;
  min-height: 0;
  height: 0;
  padding: 16rpx 40rpx 0;
  box-sizing: border-box;
}

.scroll-inner {
  box-sizing: border-box;
  padding-bottom: 24rpx;
}

.card {
  background: rgba(255, 255, 255, 0.82);
  border-radius: 48rpx;
  border: 2rpx solid var(--qy-card-stroke);
  padding: 36rpx 32rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(120, 100, 60, 0.08);
}

.scroll-tail-spacer {
  height: 8rpx;
}

.footer {
  flex-shrink: 0;
  box-sizing: border-box;
  padding: 12rpx 40rpx 0;
  padding-bottom: calc(48rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom, 0px));
}

.btn-copy {
  height: 104rpx;
  line-height: 104rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 44rpx;
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
