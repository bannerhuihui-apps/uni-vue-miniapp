<template>
  <view class="page page--pick">
    <image class="layer-bg" :src="IMG_INDEX_BG" mode="aspectFill" aria-hidden="true" />

    <view class="ui-main">
      <view class="hero-zone">
        <text class="hero-title">选择测评</text>
        <text class="hero-sub">轻游测评</text>
      </view>

      <scroll-view scroll-y enhanced class="card-scroll" :show-scrollbar="false">
        <view class="card-list">
          <view
            v-for="item in catalog"
            :key="item.id"
            class="quiz-card tap"
            :class="{ 'quiz-card--disabled': !item.target }"
            hover-class="quiz-card--pressed"
            @tap="onPick(item)"
          >
            <view class="quiz-card-top">
              <text class="quiz-card-title">{{ item.title }}</text>
              <text v-if="!item.target" class="quiz-soon">敬请期待</text>
            </view>
            <text class="quiz-card-desc">{{ item.subtitle }}</text>
            <view v-if="item.target" class="quiz-card-foot">
              <text class="quiz-card-go">进入</text>
              <text class="quiz-arrow">›</text>
            </view>
          </view>
        </view>
        <view class="scroll-pad"></view>
      </scroll-view>

      <view class="pick-footer safe-bottom">
        <view class="notice-line">测试结果仅供娱乐，不具有任何指向性及指导性，请玩家适度娱乐。</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { IMG_INDEX_BG } from "@/config/static-images";
import { testPickCatalog, type TestPickItem } from "@/data/test-pick-catalog";

const catalog = testPickCatalog;

function onPick(item: TestPickItem) {
  if (item.target === "mbti") {
    uni.navigateTo({ url: "/pages/index/index?quizId=mbti" });
    return;
  }
  if (item.target === "darkness_hub") {
    uni.navigateTo({ url: "/pages/index/index?quizId=darkness_trend" });
    return;
  }
  if (item.target === "peach_hub") {
    uni.navigateTo({ url: "/pages/index/index?quizId=peach_blossom" });
    return;
  }
  if (item.target === "crush_hub") {
    uni.navigateTo({ url: "/pages/index/index?quizId=crush_index" });
    return;
  }
  if (item.target === "birth_hub") {
    uni.navigateTo({ url: "/pages/index/index?quizId=birth_color" });
    return;
  }
  uni.showToast({ title: "该测评暂未开放", icon: "none" });
}
</script>

<style lang="scss" scoped>
.page--pick {
  background: var(--qy-page-tint);
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
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

.ui-main {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.hero-zone {
  flex-shrink: 0;
  /* 标题区略收紧，把垂直空间留给下方卡片，避免与背景图视觉中心抢位 */
  padding: calc(100rpx + env(safe-area-inset-top)) 44rpx 16rpx;
  box-sizing: border-box;
}

.hero-title {
  display: block;
  font-size: 52rpx;
  font-weight: 700;
  color: rgba(90, 86, 82, 0.96);
  letter-spacing: 2rpx;
}

.hero-sub {
  display: block;
  margin-top: 12rpx;
  font-size: 28rpx;
  line-height: 1.45;
  color: rgba(120, 116, 110, 0.88);
}

.card-scroll {
  flex: 1;
  min-height: 200rpx;
  height: 0;
  width: 100%;
  /* 整体下移卡片区，避开 index 背景图偏上的图案与文字区（可按真机再调） */
  padding: 520rpx 40rpx 0;
  box-sizing: border-box;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.quiz-card {
  padding: 26rpx 30rpx 22rpx;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.82);
  border: 2rpx solid rgba(176, 214, 198, 0.55);
  box-shadow: 0 12rpx 28rpx rgba(88, 120, 106, 0.1);
  box-sizing: border-box;
}

.quiz-card--disabled {
  opacity: 0.78;
}

.quiz-card--pressed {
  opacity: 0.9;
}

.quiz-card-top {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.quiz-card-title {
  flex: 1;
  font-size: 34rpx;
  font-weight: 700;
  color: rgba(55, 52, 48, 0.94);
}

.quiz-soon {
  flex-shrink: 0;
  font-size: 22rpx;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  color: rgba(130, 120, 112, 0.95);
  background: rgba(245, 240, 232, 0.95);
  border: 1rpx solid rgba(200, 190, 175, 0.55);
}

.quiz-card-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  line-height: 1.5;
  color: rgba(110, 106, 100, 0.88);
}

.quiz-card-foot {
  margin-top: 18rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 4rpx;
}

.quiz-card-go {
  font-size: 28rpx;
  font-weight: 600;
  color: rgba(46, 120, 90, 0.95);
}

.quiz-arrow {
  font-size: 34rpx;
  line-height: 1;
  color: rgba(46, 120, 90, 0.75);
}

.scroll-pad {
  height: 28rpx;
}

/** 与首页 `pages/index/index` footer 免责区一致：边距 + `.notice-line` 样式 */
.pick-footer {
  flex-shrink: 0;
  padding-left: 64rpx;
  padding-right: 64rpx;
  box-sizing: border-box;
}

.notice-line {
  flex-shrink: 0;
  padding-top: 24rpx;
  text-align: center;
  font-size: 26rpx;
  line-height: 1.45;
  color: rgba(140, 134, 130, 0.95);
  padding-left: 12rpx;
  padding-right: 12rpx;
  box-sizing: border-box;
}

.safe-bottom {
  padding-bottom: calc(72rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(72rpx + env(safe-area-inset-bottom, 0px));
}

.tap:active {
  opacity: 0.88;
}
</style>
