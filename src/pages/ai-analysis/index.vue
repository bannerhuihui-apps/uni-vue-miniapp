<template>
  <view class="page z-ai">
    <image class="bg" :src="IMG_QUESTION_BG" mode="aspectFill" />
    <view class="mask"></view>

    <view class="stack">
      <ZhiwoNavBar title="AI 综合分析" title-color="rgba(0,0,0,0.78)" />

      <view v-if="loading" class="state-box">
        <text class="state-text">正在生成分析报告…</text>
      </view>

      <view v-else-if="errorMsg" class="state-box">
        <text class="state-text state-text--error">{{ errorMsg }}</text>
      </view>

      <template v-else>
        <scroll-view scroll-y enhanced class="scroll-area" :show-scrollbar="false">
          <view class="scroll-inner">
            <view v-if="modelLabel" class="meta-badge">{{ modelLabel }}</view>
            <view class="card">
              <text class="report-body">{{ content }}</text>
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
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { mgAiReport } from "@/api/minigame";
import { IMG_QUESTION_BG } from "@/config/static-images";
import ZhiwoNavBar from "@/components/ZhiwoNavBar.vue";
import { minigameApp } from "@/state/minigame-app";

const loading = ref(true);
const errorMsg = ref("");
const content = ref("");
const model = ref("");

const modelLabel = computed(() => {
  const m = model.value.trim();
  if (!m) return "";
  if (m.startsWith("template")) return "模板报告（DeepSeek 未接入）";
  return `模型：${m}`;
});

onLoad(() => {
  loadReport();
});

async function loadReport() {
  loading.value = true;
  errorMsg.value = "";
  content.value = "";

  const userId = minigameApp.userId;
  if (!userId || minigameApp.authStatus !== "success") {
    loading.value = false;
    errorMsg.value = "请先登录后再查看 AI 分析。";
    return;
  }

  try {
    const res = await mgAiReport(userId);
    content.value = String(res?.content ?? "").trim();
    model.value = String(res?.model ?? "").trim();
    if (!content.value) {
      errorMsg.value = "报告内容为空，请稍后再试。";
    }
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : "报告生成失败";
  } finally {
    loading.value = false;
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
  padding: 40rpx;
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

.meta-badge {
  display: block;
  margin-bottom: 20rpx;
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 600;
  color: rgba(120, 90, 50, 0.88);
  background: rgba(255, 244, 210, 0.92);
  border: 2rpx solid rgba(201, 172, 118, 0.45);
}

.card {
  background: rgba(255, 255, 255, 0.76);
  border-radius: 48rpx;
  border: 2rpx solid var(--qy-card-stroke);
  padding: 28rpx 32rpx;
}

.report-body {
  display: block;
  font-size: 34rpx;
  line-height: 1.55;
  color: var(--qy-text-mute);
  white-space: pre-wrap;
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
