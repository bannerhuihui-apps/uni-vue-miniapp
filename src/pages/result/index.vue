<template>
  <view class="result-root">
    <view class="page-inner">
      <image class="bg" :src="IMG_QUESTION_BG" mode="aspectFill" aria-hidden="true" />
      <view class="mask"></view>

      <view class="stack">
        <ZhiwoNavBar :title="ctx.pageTitle" title-color="rgba(0,0,0,0.72)" />
        <scroll-view scroll-y enhanced class="main-scroll" :show-scrollbar="false">
          <view class="result-scroll-inner">
            <view class="result-card">
                <view class="type-row">
                  <text class="type-code" :class="{ 'type-code--compact': ctx.compactTypeHead }">{{ ctx.card.typeCode }}</text>
                  <text class="type-alias">{{ ctx.card.alias }}</text>
                </view>

                <view class="kw-title">关键词</view>
                <view v-if="ctx.card.keywords.length" class="keyword-row">
                  <view v-for="kw in ctx.card.keywords" :key="kw" class="kw">{{ kw }}</view>
                </view>
                <view v-else class="kw-empty">暂无关键词</view>

                <view v-if="ctx.card.showDimension" class="dim-block">
                  <view class="dim-heading">维度倾向</view>
                  <view v-for="(row, i) in ctx.card.dimRows" :key="i" class="dim-row-res">
                    <view class="dim-bar">
                      <view class="dim-grad" :style="{ background: row.grad }"></view>
                      <view class="dim-split" :style="{ left: row.splitPercent + '%' }"></view>
                      <view class="dim-captions">
                        <text class="dim-cap dim-cap--left">{{ row.leftCaption }}</text>
                        <text class="dim-cap dim-cap--right">{{ row.rightCaption }}</text>
                      </view>
                    </view>
                  </view>
                </view>

                <view class="section">
                  <text class="section-title">{{ ctx.sectionTitles.summary }}</text>
                  <text class="section-body">{{ ctx.card.summary }}</text>
                </view>
                <view class="section">
                  <text class="section-title">{{ ctx.sectionTitles.strengths }}</text>
                  <text class="section-body">{{ ctx.card.strengths }}</text>
                </view>
                <view class="section">
                  <text class="section-title">{{ ctx.sectionTitles.fit }}</text>
                  <text class="section-body">{{ ctx.card.fit }}</text>
                </view>
              </view>
              <view class="result-scroll-tail"></view>
          </view>
        </scroll-view>

        <view class="actions actions--fixed">
          <view v-if="ctx.mode === 'self'" class="btn lemon tap" @tap="onInvite">邀请朋友来测</view>
          <view class="btn lemon tap" @tap="goHome">返回首页</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { IMG_QUESTION_BG } from "@/config/static-images";
import ZhiwoNavBar from "@/components/ZhiwoNavBar.vue";
import {
  buildResultPageState,
  type ResultCardView,
  type ResultPageState,
} from "@/utils/minigame/result-page-state";
import { minigameApp } from "@/state/minigame-app";
import { reLaunchIndexHome } from "@/utils/minigame/index-home";
import {
  isUiPreviewQuery,
  parsePreviewQuizId,
  seedMutualResultPreview,
} from "@/utils/minigame/ui-preview";

const emptyCard: ResultCardView = {
  typeCode: "--",
  alias: "类型说明",
  keywords: [],
  summary: "",
  strengths: "",
  fit: "",
  showDimension: false,
  dimRows: [],
};

const ctx = reactive<ResultPageState>({
  pageTitle: "测试结果",
  mode: "self",
  sectionTitles: {
    summary: "类型简介",
    strengths: "性格优势",
    fit: "适合方向",
  },
  card: emptyCard,
});

onLoad((q) => {
  if (isUiPreviewQuery(q as Record<string, unknown>)) {
    seedMutualResultPreview(parsePreviewQuizId(q as Record<string, unknown>));
  }
});

onShow(() => {
  const n = buildResultPageState();
  ctx.pageTitle = n.pageTitle;
  ctx.mode = n.mode;
  ctx.sectionTitles = n.sectionTitles;
  ctx.compactTypeHead = n.compactTypeHead;
  ctx.card = n.card;
});

function onInvite() {
  const qid = encodeURIComponent(minigameApp.sessionQuizId || minigameApp.lastQuizContext?.quizId || "mbti");
  uni.navigateTo({ url: `/pages/invite/index?quizId=${qid}` });
}

function goHome() {
  reLaunchIndexHome(minigameApp.lastQuizContext?.quizId || minigameApp.sessionQuizId);
}
</script>

<style lang="scss" scoped>
.result-root {
  min-height: 100vh;
  height: 100vh;
  box-sizing: border-box;
  background: var(--qy-page-tint);
}

.page-inner {
  position: relative;
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.mask {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
}

.stack {
  position: relative;
  z-index: 1;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.main-scroll {
  flex: 1;
  min-height: 0;
  height: 0;
  padding: 0 40rpx;
  box-sizing: border-box;
}

.result-scroll-inner {
  box-sizing: border-box;
}

.result-scroll-tail {
  height: 24rpx;
}

.result-card {
  padding: 32rpx 36rpx 40rpx;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.76);
  border-radius: 56rpx;
  border: 2rpx solid var(--qy-card-stroke);
}

.type-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 12rpx 20rpx;
}

.type-code {
  font-size: 108rpx;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.82);
  line-height: 1.05;
}

.type-code--compact {
  font-size: 80rpx;
  line-height: 1.15;
}

.type-alias {
  font-size: 48rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  line-height: 1.2;
}

.kw-title {
  margin-top: 28rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: rgba(120, 106, 97, 0.88);
}

.keyword-row {
  margin-top: 24rpx;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
}

.kw {
  padding: 8rpx 22rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
  color: rgba(0, 0, 0, 0.66);
  background: rgba(198, 240, 219, 0.45);
  border: 2rpx solid rgba(255, 255, 255, 0.85);
}

.kw-empty {
  margin-top: 24rpx;
  font-size: 32rpx;
  color: rgba(0, 0, 0, 0.55);
}

.dim-block {
  margin-top: 36rpx;
}

.dim-heading {
  font-size: 32rpx;
  font-weight: 700;
  color: rgba(120, 106, 97, 0.88);
  margin-bottom: 20rpx;
}

.dim-row-res {
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.dim-bar {
  position: relative;
  height: 48rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.dim-grad {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.dim-split {
  position: absolute;
  top: 8rpx;
  bottom: 8rpx;
  width: 6rpx;
  margin-left: -3rpx;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 3rpx;
}

.dim-captions {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  box-sizing: border-box;
  pointer-events: none;
}

.dim-cap {
  font-size: 28rpx;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.96);
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.25);
  max-width: 48%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section {
  margin-top: 36rpx;
}

.section-title {
  display: block;
  font-size: 42rpx;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.78);
  margin-bottom: 16rpx;
}

.section-body {
  display: block;
  font-size: 36rpx;
  line-height: 1.65;
  color: rgba(0, 0, 0, 0.62);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.actions--fixed {
  flex-shrink: 0;
  margin-top: 0;
  /*  Quiz 底部控件约 96rpx + safe-area；结果页也需充足垫高，避免与 Home 指示条/手势区重叠  */
  padding: 16rpx 40rpx 0;
  padding-bottom: calc(48rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

.btn {
  height: 96rpx;
  line-height: 96rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 56rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  border: 2rpx solid var(--qy-card-stroke);
  box-sizing: border-box;
}

.btn.lemon {
  background: var(--qy-lemon);
}

.tap:active {
  opacity: 0.9;
}
</style>
