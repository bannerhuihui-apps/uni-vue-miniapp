<template>
  <view class="zw-nav" :class="{ 'zw-nav--layer': layered }">
    <view class="zw-nav-inner" :style="innerStyle">
      <view class="zw-nav-left">
        <view v-if="back" class="zw-nav-back-hit" aria-role="button" @tap="goBack">
          <view class="zw-nav-back-icon" />
        </view>
      </view>
      <view class="zw-nav-center" :style="{ color: titleColor }">
        {{ title }}
      </view>
      <view class="zw-nav-right" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { reLaunchIndexHome } from "@/utils/minigame/index-home";

const props = withDefaults(
  defineProps<{
    title: string;
    back?: boolean;
    titleColor?: string;
    background?: string;
    /** quiz 等与底图叠加时抬高 z-index */
    layered?: boolean;
  }>(),
  {
    back: true,
    titleColor: "rgba(0,0,0,0.72)",
    background: "transparent",
    layered: false,
  },
);

function readStatusBarHeight(): number {
  try {
    const w = uni.getWindowInfo();
    if (w && typeof w.statusBarHeight === "number") return w.statusBarHeight;
  } catch {
    /* 低版本/uni */
  }
  try {
    return uni.getSystemInfoSync().statusBarHeight ?? 22;
  } catch {
    return 22;
  }
}

const statusBarPx = ref(readStatusBarHeight());

function goBack() {
  uni.navigateBack({
    delta: 1,
    fail: () => reLaunchIndexHome(),
  });
}

const innerStyle = computed(() => ({
  paddingTop: `${statusBarPx.value}px`,
  color: props.titleColor,
  background: props.background,
}));
</script>

<style lang="scss" scoped>
.zw-nav {
  flex-shrink: 0;
  width: 100%;
  overflow: hidden;
}

.zw-nav--layer {
  position: relative;
  z-index: 4;
}

.zw-nav-inner {
  --zw-bar-h: 44px;
  --zw-pl: 16px;
  min-height: calc(var(--zw-bar-h));
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.zw-nav-left {
  flex-shrink: 0;
  min-width: 88rpx;
  display: flex;
  align-items: center;
  padding-left: var(--zw-pl);
  box-sizing: border-box;
  height: var(--zw-bar-h);
}

.zw-nav-back-hit {
  padding: 22rpx 36rpx 22rpx 32rpx;
  margin: -22rpx -36rpx -22rpx -32rpx;
}

.zw-nav-back-icon {
  width: 24rpx;
  height: 48rpx;
  background-color: currentColor;
  /* weui arrow */
  -webkit-mask: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='24' viewBox='0 0 12 24'%3E%3Cpath fill-opacity='.9' fill-rule='evenodd' d='M10 19.438L8.955 20.5l-7.666-7.79a1.02 1.02 0 0 1 0-1.42L8.955 3.5 10 4.563 2.682 12 10 19.438z'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
  mask: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='24' viewBox='0 0 12 24'%3E%3Cpath fill-opacity='.9' fill-rule='evenodd' d='M10 19.438L8.955 20.5l-7.666-7.79a1.02 1.02 0 0 1 0-1.42L8.955 3.5 10 4.563 2.682 12 10 19.438z'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
  -webkit-mask-size: cover;
  mask-size: cover;
}

.zw-nav-center {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 44px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.zw-nav-right {
  flex-shrink: 0;
  width: 88rpx;
  height: var(--zw-bar-h);
}
</style>
