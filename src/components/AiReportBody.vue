<template>
  <view class="ai-report">
    <template v-for="(block, idx) in blocks" :key="idx">
      <view v-if="block.kind === 'title'" class="report-title">{{ block.text }}</view>

      <view
        v-else-if="block.kind === 'heading'"
        class="report-heading"
        :class="block.level === 2 ? 'report-heading--l2' : 'report-heading--l3'"
      >
        <view class="report-heading__bar" aria-hidden="true" />
        <text class="report-heading__text">{{ block.text }}</text>
      </view>

      <view v-else-if="block.kind === 'divider'" class="report-divider" aria-hidden="true" />

      <view v-else-if="block.kind === 'disclaimer'" class="report-disclaimer">
        <text
          v-for="(part, pi) in block.inlines"
          :key="pi"
          :class="part.kind === 'bold' ? 'report-disclaimer__bold' : 'report-disclaimer__text'"
        >{{ part.text }}</text>
      </view>

      <view v-else class="report-para">
        <text
          v-for="(part, pi) in block.inlines"
          :key="pi"
          :class="part.kind === 'bold' ? 'report-para__bold' : 'report-para__text'"
        >{{ part.text }}</text>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { parseAiReportContent } from "@/utils/minigame/ai-report-format";

const props = defineProps<{
  content: string;
}>();

const blocks = computed(() => parseAiReportContent(props.content));
</script>

<style lang="scss" scoped>
.ai-report {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.report-title {
  display: block;
  text-align: center;
  font-size: 40rpx;
  font-weight: 800;
  line-height: 1.35;
  color: rgba(48, 42, 36, 0.92);
  letter-spacing: 2rpx;
  padding-bottom: 8rpx;
}

.report-heading {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-top: 8rpx;
}

.report-heading--l2 {
  margin-top: 12rpx;
}

.report-heading__bar {
  flex-shrink: 0;
  width: 8rpx;
  height: 36rpx;
  margin-top: 6rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #f5d76e 0%, #d4a84b 100%);
  box-shadow: 0 2rpx 8rpx rgba(180, 140, 60, 0.25);
}

.report-heading--l2 .report-heading__bar {
  height: 40rpx;
}

.report-heading__text {
  flex: 1;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 1.45;
  color: rgba(72, 58, 38, 0.95);
}

.report-heading--l2 .report-heading__text {
  font-size: 36rpx;
}

.report-divider {
  height: 2rpx;
  margin: 12rpx 8rpx;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(201, 172, 118, 0.45) 20%,
    rgba(201, 172, 118, 0.45) 80%,
    transparent 100%
  );
}

.report-para {
  display: block;
  font-size: 30rpx;
  line-height: 1.72;
  color: rgba(72, 68, 64, 0.9);
  text-align: justify;
}

.report-para__text {
  font-size: inherit;
  line-height: inherit;
  color: inherit;
}

.report-para__bold {
  font-size: inherit;
  line-height: inherit;
  font-weight: 700;
  color: rgba(48, 42, 36, 0.95);
}

.report-disclaimer {
  display: block;
  margin-top: 12rpx;
  padding: 20rpx 22rpx;
  border-radius: 24rpx;
  background: rgba(255, 248, 230, 0.88);
  border: 2rpx solid rgba(201, 172, 118, 0.35);
  font-size: 24rpx;
  line-height: 1.6;
}

.report-disclaimer__text {
  font-size: inherit;
  line-height: inherit;
  color: rgba(120, 100, 70, 0.88);
}

.report-disclaimer__bold {
  font-size: inherit;
  line-height: inherit;
  font-weight: 700;
  color: rgba(100, 80, 50, 0.92);
}
</style>
