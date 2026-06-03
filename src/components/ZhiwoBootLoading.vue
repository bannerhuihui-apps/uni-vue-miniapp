<template>
  <view class="z-boot-loading">
    <view
      v-if="showGear"
      class="gear-wrap gear-loading tap"
      :style="gearWrapStyle"
      @tap="emit('settings')"
    >
      <view class="gear-circle gear-circle--light">
        <image class="gear-icon" :src="IMG_SETTINGS" mode="aspectFit" />
      </view>
    </view>
    <view class="loading-dim" aria-hidden="true"></view>
    <view class="loading-card">
      <text class="loading-title">{{ title }}</text>
      <view class="loading-track" aria-hidden="true">
        <view class="loading-fill"></view>
      </view>
      <text v-if="hint" class="loading-hint">{{ hint }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { IMG_SETTINGS } from "@/config/static-images";
import { readTopRightGearTopPx } from "@/utils/minigame/nav-chrome";

withDefaults(
  defineProps<{
    title?: string;
    hint?: string;
    showGear?: boolean;
  }>(),
  {
    title: "加载中",
    hint: "",
    showGear: true,
  },
);

const emit = defineEmits<{
  settings: [];
}>();

const gearTopPx = ref(readTopRightGearTopPx());
const gearWrapStyle = computed(() => ({ top: `${gearTopPx.value}px` }));

onShow(() => {
  gearTopPx.value = readTopRightGearTopPx();
});
</script>

<style lang="scss" scoped>
.z-boot-loading {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  z-index: 20;
  box-sizing: border-box;
}

.gear-loading {
  z-index: 22;
}

.gear-wrap {
  position: absolute;
  right: 40rpx;
  z-index: 21;
  width: 84rpx;
  height: 84rpx;
}

.gear-circle {
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.gear-circle--light {
  background: linear-gradient(135deg, rgba(214, 241, 228, 0.96) 0%, rgba(255, 239, 201, 0.94) 100%);
  border: 2rpx solid rgba(176, 214, 198, 0.95);
  box-shadow: 0 8rpx 20rpx rgba(98, 126, 116, 0.18);
}

.gear-icon {
  width: 56rpx;
  height: 56rpx;
  opacity: 0.9;
}

.loading-dim {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 250, 244, 0.18);
  z-index: 20;
}

.loading-card {
  position: absolute;
  left: 50%;
  bottom: 456rpx;
  transform: translateX(-50%);
  width: calc(100% - 240rpx);
  padding: 36rpx 36rpx 40rpx;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.66);
  border-radius: 44rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.72);
  box-shadow: var(--qy-card-shadow-modal);
  z-index: 23;
}

.loading-title {
  display: block;
  text-align: center;
  font-size: 40rpx;
  font-weight: 700;
  color: rgba(106, 94, 87, 0.96);
  margin-bottom: 24rpx;
}

.loading-track {
  height: 32rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.5);
  border: 2rpx solid rgba(255, 255, 255, 0.72);
  overflow: hidden;
  box-sizing: border-box;
}

.loading-fill {
  height: 100%;
  border-radius: 999rpx;
  width: 72%;
  background: linear-gradient(90deg, rgba(213, 241, 228, 0.96), rgba(255, 241, 207, 0.96));
  animation: boot-loading-scan 1.65s ease-in-out infinite alternate;
}

@keyframes boot-loading-scan {
  0% {
    width: 32%;
    opacity: 0.88;
  }
  100% {
    width: 92%;
    opacity: 1;
  }
}

.loading-hint {
  display: block;
  margin-top: 28rpx;
  text-align: center;
  font-size: 26rpx;
  line-height: 1.45;
  color: var(--qy-text-mute);
}

.tap:active {
  opacity: 0.85;
}
</style>
