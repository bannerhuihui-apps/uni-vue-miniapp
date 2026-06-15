<template>
  <view v-if="visible" class="ai-sample-overlay">
    <view class="ai-sample-overlay__mask tap" @tap="emit('close')"></view>
    <view class="ai-sample-overlay__panel" @tap.stop="">
      <view class="ai-sample-overlay__bar">
        <text class="ai-sample-overlay__title">AI 报告示例</text>
        <text class="ai-sample-overlay__close tap" @tap="emit('close')">关闭</text>
      </view>
      <scroll-view scroll-y enhanced class="ai-sample-overlay__scroll" :show-scrollbar="false">
        <view class="ai-sample-overlay__inner">
          <view class="ai-sample-overlay__hint">以下为示例内容，完成互测后将生成你的专属报告</view>
          <view class="ai-sample-overlay__card">
            <AiReportBody :content="AI_REPORT_SAMPLE_CONTENT" />
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import AiReportBody from "@/components/AiReportBody.vue";
import { AI_REPORT_SAMPLE_CONTENT } from "@/data/ai-report-sample";

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<style lang="scss" scoped>
.ai-sample-overlay {
  position: fixed;
  inset: 0;
  z-index: 110;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  box-sizing: border-box;
}

.ai-sample-overlay__mask {
  position: absolute;
  inset: 0;
  background: rgba(32, 28, 24, 0.52);
}

.ai-sample-overlay__panel {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 82vh;
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: rgba(255, 252, 246, 0.98);
  border-radius: 40rpx 40rpx 0 0;
  border: 2rpx solid rgba(196, 168, 118, 0.28);
  box-shadow: 0 -8rpx 40rpx rgba(80, 60, 40, 0.12);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-sizing: border-box;
}

.ai-sample-overlay__bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx 20rpx;
  box-sizing: border-box;
}

.ai-sample-overlay__title {
  font-size: 36rpx;
  font-weight: 700;
  color: rgba(72, 62, 52, 0.94);
}

.ai-sample-overlay__close {
  font-size: 30rpx;
  font-weight: 600;
  color: rgba(118, 108, 98, 0.88);
  padding: 8rpx 12rpx;
}

.ai-sample-overlay__scroll {
  flex: 1;
  width: 100%;
  min-height: 320rpx;
  height: calc(82vh - 96rpx);
  max-height: calc(86vh - 96rpx);
  box-sizing: border-box;
}

.ai-sample-overlay__inner {
  padding: 0 32rpx 40rpx;
  box-sizing: border-box;
}

.ai-sample-overlay__hint {
  display: block;
  margin-bottom: 20rpx;
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 600;
  color: rgba(100, 78, 48, 0.88);
  background: rgba(255, 244, 210, 0.92);
  border: 2rpx solid rgba(201, 172, 118, 0.4);
}

.ai-sample-overlay__card {
  background: rgba(255, 255, 255, 0.82);
  border-radius: 32rpx;
  border: 2rpx solid var(--qy-card-stroke);
  padding: 32rpx 28rpx;
  box-shadow: 0 8rpx 28rpx rgba(120, 100, 60, 0.08);
  box-sizing: border-box;
}

.tap:active {
  opacity: 0.88;
}
</style>
