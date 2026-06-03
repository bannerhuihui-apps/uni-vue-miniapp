<template>
  <view class="page z-info">
    <image class="bg" :src="IMG_QUESTION_BG" mode="aspectFill" />
    <view class="mask"></view>

    <view class="stack">
      <ZhiwoNavBar :title="navTitle" title-color="rgba(0,0,0,0.78)" />
      <view
        class="info-swipe-zone"
        @touchstart="onInfoTouchStart"
        @touchend="onInfoTouchEnd"
        @touchcancel="onInfoTouchCancel"
      >
        <view v-if="tagline" class="dimension-line">{{ tagline }}</view>

        <scroll-view scroll-y enhanced class="main-scroll" :show-scrollbar="false">
          <view class="info-scroll-inner">
            <view class="info-card" :class="{ 'info-card--tier': isTierSlide }">
            <view class="index-pill">{{ pillText }}</view>

            <image
              v-if="isTierSlide && cur.imageSrc"
              class="tier-info-img"
              :src="cur.imageSrc"
              mode="widthFix"
            />

            <view v-if="isTierSlide && cur.scoreRangeLabel" class="tier-score-pill">
              {{ cur.scoreRangeLabel }}
            </view>

            <view class="type-row" :class="{ 'type-row--stacked': isScoredMode || isTierSlide }">
              <text
                class="type-code"
                :class="{ 'type-code--tier': isTierSlide }"
              >{{ isTierSlide ? cur.alias : cur.type }}</text>
              <text
                v-if="!isTierSlide"
                class="type-alias"
                :class="{ 'type-alias--stack': isScoredMode }"
              >{{ cur.alias }}</text>
            </view>

            <view class="keyword-row">
              <view v-for="kw in cur.keywords" :key="kw" class="kw">{{ kw }}</view>
              <view v-if="isScoredMode && !isTierSlide && cur.keywords?.length === 0" class="kw kw--mute">读本套说明</view>
            </view>

            <view class="section">
              <text class="section-title">{{ sectionTitle1 }}</text>
              <text class="section-body">{{ cur.summary }}</text>
            </view>
            <view class="section">
              <text class="section-title">{{ sectionTitle2 }}</text>
              <text class="section-body">{{ cur.strengths }}</text>
            </view>
            <view class="section">
              <text class="section-title">{{ sectionTitle3 }}</text>
              <text class="section-body">{{ cur.fit }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
      </view>

      <view class="info-footer">
        <view class="type-nav">
          <view class="type-nav-btn tap" @tap="prev">{{ prevBtnLabel }}</view>
          <view class="type-nav-btn tap" @tap="next">{{ nextBtnLabel }}</view>
        </view>

        <view class="bottom-bar">
          <view class="home-btn tap" @tap="goHome">返回首页</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { IMG_QUESTION_BG } from "@/config/static-images";
import ZhiwoNavBar from "@/components/ZhiwoNavBar.vue";
import MBTI_LIST from "@/data/mbti-types";
import {
  type QuizInfoSlide,
  guessQuizInfoSlideIndex,
  getQuizInfoPages,
  isScoredQuizInfoId,
} from "@/data/quiz-info-pages";
import type { SessionQuizId } from "@/state/minigame-app";
import { reLaunchIndexHome } from "@/utils/minigame/index-home";

const MBTI_CATALOG = MBTI_LIST as QuizInfoSlide[];

const quizIdRef = ref<SessionQuizId>("mbti");
const ix = ref(0);

function parseRouteQuizId(raw: unknown): SessionQuizId {
  const q = typeof raw === "string" ? decodeURIComponent(raw).trim().toLowerCase() : "";
  if (q === "darkness_trend") return "darkness_trend";
  if (q === "peach_blossom") return "peach_blossom";
  if (q === "crush_index") return "crush_index";
  if (q === "birth_color") return "birth_color";
  return "mbti";
}

const slideCatalog = computed((): QuizInfoSlide[] => {
  const q = quizIdRef.value;
  if (isScoredQuizInfoId(q)) return getQuizInfoPages(q);
  return MBTI_CATALOG;
});

const catalogLen = computed(() => slideCatalog.value.length || 1);

const infoSwipeEnabled = computed(() => catalogLen.value > 1);

const INFO_SWIPE_THRESHOLD_PX = 36;

type InfoTouchEvent = {
  touches?: Array<{ clientX?: number; pageX?: number; clientY?: number; pageY?: number }>;
  changedTouches?: Array<{ clientX?: number; pageX?: number; clientY?: number; pageY?: number }>;
};

let infoTouchStartX = 0;
let infoTouchStartY = 0;
let infoTouchActive = false;

function readInfoTouchXY(e: InfoTouchEvent): { x: number; y: number } {
  const t = e.touches?.[0] ?? e.changedTouches?.[0];
  if (!t) return { x: 0, y: 0 };
  return { x: t.clientX ?? t.pageX ?? 0, y: t.clientY ?? t.pageY ?? 0 };
}

function onInfoTouchStart(e: InfoTouchEvent) {
  if (!infoSwipeEnabled.value) return;
  const { x, y } = readInfoTouchXY(e);
  infoTouchStartX = x;
  infoTouchStartY = y;
  infoTouchActive = true;
}

function onInfoTouchEnd(e: InfoTouchEvent) {
  if (!infoTouchActive || !infoSwipeEnabled.value) {
    infoTouchActive = false;
    return;
  }
  infoTouchActive = false;

  const { x, y } = readInfoTouchXY(e);
  const dx = x - infoTouchStartX;
  const dy = y - infoTouchStartY;
  if (Math.abs(dx) < INFO_SWIPE_THRESHOLD_PX || Math.abs(dx) <= Math.abs(dy)) return;

  if (dx < 0) next();
  else prev();
}

function onInfoTouchCancel() {
  infoTouchActive = false;
}

const modIx = computed(
  () => ((ix.value % catalogLen.value) + catalogLen.value) % catalogLen.value,
);

const cur = computed(() => slideCatalog.value[modIx.value]!);

const isScoredMode = computed(() => isScoredQuizInfoId(quizIdRef.value));

const isTierSlide = computed(() => !!cur.value.tierSlide);

const navTitle = computed(() => {
  if (quizIdRef.value === "mbti") return "性格类型说明";
  if (quizIdRef.value === "darkness_trend") return "黑化趋势测评说明";
  if (quizIdRef.value === "peach_blossom") return "桃花体质测评说明";
  if (quizIdRef.value === "crush_index") return "花痴指数测评说明";
  if (quizIdRef.value === "birth_color") return "本命颜色测评说明";
  return "测评说明";
});

const tagline = computed(() => {
  if (quizIdRef.value === "mbti") return "E/I内外向 S/N实感直觉 T/F思考情感 J/P判断知觉";
  if (quizIdRef.value === "darkness_trend") {
    return isTierSlide.value
      ? "五档分值说明 · 配图导读（共 10 题）"
      : "玩法与计分 · 五档分值说明（共 6 页）";
  }
  if (quizIdRef.value === "peach_blossom") {
    return isTierSlide.value
      ? "四档分值说明 · 配图导读（共 10 题）"
      : "玩法与计分 · 四档分值说明（共 5 页）";
  }
  if (quizIdRef.value === "crush_index") {
    return isTierSlide.value
      ? "五档分值说明 · 配图导读（共 10 题）"
      : "玩法与计分 · 五档分值说明（共 6 页）";
  }
  if (quizIdRef.value === "birth_color") {
    return isTierSlide.value
      ? "八色分值说明 · 配图导读（共 10 题）"
      : "玩法与计分 · 八色分值说明（共 9 页）";
  }
  return "";
});

const pillText = computed(() => {
  if (isScoredMode.value) return `第 ${modIx.value + 1} 页 / ${catalogLen.value} 页`;
  return `类型 ${modIx.value + 1} / ${catalogLen.value}`;
});

const prevBtnLabel = computed(() => (isScoredMode.value ? "上一页" : "上一型"));

const nextBtnLabel = computed(() => (isScoredMode.value ? "下一页" : "下一型"));

const sectionTitle1 = computed(() => {
  if (isTierSlide.value) return "档位说明";
  if (isScoredMode.value) return "内容提要";
  return "类型简介";
});
const sectionTitle2 = computed(() => {
  if (isTierSlide.value) return "内心独白";
  if (isScoredMode.value) return "趣味解读";
  return "性格优势";
});
const sectionTitle3 = computed(() => {
  if (isTierSlide.value) return "小提示";
  if (isScoredMode.value) return "温馨提示";
  return "适合方向";
});

onLoad((q) => {
  const qid = parseRouteQuizId(q?.quizId);
  quizIdRef.value = qid;

  const typeRaw = typeof q?.type === "string" ? decodeURIComponent(String(q.type)) : "";

  if (isScoredQuizInfoId(qid)) {
    ix.value = guessQuizInfoSlideIndex(qid, typeRaw);
    return;
  }

  if (typeRaw) {
    const idx = MBTI_CATALOG.findIndex((x) => x.type === String(typeRaw).toUpperCase());
    if (idx >= 0) ix.value = idx;
  } else {
    ix.value = 0;
  }
});

function prev() {
  ix.value -= 1;
}

function next() {
  ix.value += 1;
}

function goHome() {
  reLaunchIndexHome(quizIdRef.value);
}
</script>

<style lang="scss" scoped>
.z-info.page {
  position: relative;
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: var(--qy-page-tint);
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
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
}

.stack {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.dimension-line {
  text-align: center;
  padding: 4rpx 32rpx 20rpx;
  font-size: 26rpx;
  line-height: 1.45;
  color: rgba(0, 0, 0, 0.62);
}

.info-swipe-zone {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.main-scroll {
  flex: 1;
  min-height: 0;
  height: 0;
  padding: 0 40rpx;
  box-sizing: border-box;
}

.info-scroll-inner {
  box-sizing: border-box;
  padding-bottom: 24rpx;
}

.info-card {
  position: relative;
  padding: 36rpx 36rpx 40rpx;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.78);
  border-radius: 52rpx;
  border: 2rpx solid var(--qy-card-stroke);
  box-shadow: var(--qy-card-shadow);
}

.info-card--tier {
  padding-top: 28rpx;
}

.tier-info-img {
  display: block;
  width: 100%;
  margin-top: 24rpx;
  border-radius: 28rpx;
  overflow: hidden;
}

.tier-score-pill {
  display: inline-block;
  margin-top: 20rpx;
  padding: 0 24rpx;
  height: 56rpx;
  line-height: 56rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: rgba(90, 86, 82, 0.92);
  background: rgba(255, 255, 255, 0.72);
  border: 2rpx solid rgba(255, 255, 255, 0.9);
}

.type-code--tier {
  font-size: 56rpx;
  line-height: 1.15;
}

.info-card--tier .keyword-row {
  margin-top: 16rpx;
}

.info-card--tier .section {
  margin-top: 28rpx;
}

.index-pill {
  display: inline-block;
  padding: 0 24rpx;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 999rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  background: var(--qy-mint);
}

.type-row {
  position: relative;
  margin-top: 28rpx;
  min-height: 96rpx;
}

.type-row--stacked .type-code {
  font-size: 56rpx;
  line-height: 1.15;
}

.type-alias--stack {
  position: static;
  display: block;
  margin-top: 12rpx;
  margin-left: 0;
}

.type-code {
  display: block;
  font-size: 84rpx;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.82);
  line-height: 1.05;
}

.kw--mute {
  opacity: 0.85;
  background: rgba(255, 255, 255, 0.45);
}

.type-alias {
  position: absolute;
  left: 264rpx;
  top: 0;
  font-size: 48rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  line-height: 1.2;
}

.keyword-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 20rpx;
}

.kw {
  padding: 0 20rpx;
  height: 56rpx;
  line-height: 56rpx;
  border-radius: 28rpx;
  font-size: 30rpx;
  color: var(--qy-link-strong);
  background: var(--qy-lemon);
}

.section {
  margin-top: 32rpx;
}

.section-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.76);
  line-height: 1.35;
}

.section-body {
  display: block;
  margin-top: 12rpx;
  font-size: 34rpx;
  line-height: 50rpx;
  color: rgba(0, 0, 0, 0.62);
  white-space: pre-line;
}

.type-nav {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  padding: 20rpx 40rpx 16rpx;
  box-sizing: border-box;
}

.type-nav-btn {
  width: 240rpx;
  height: 92rpx;
  line-height: 92rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 40rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  background: var(--qy-lemon);
  border: 2rpx solid var(--qy-card-stroke);
  box-sizing: border-box;
}

.info-footer {
  flex-shrink: 0;
  box-sizing: border-box;
  padding-bottom: calc(48rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom, 0px));
}

.bottom-bar {
  flex-shrink: 0;
  padding: 0 40rpx;
  box-sizing: border-box;
}

.home-btn {
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
  opacity: 0.88;
}
</style>
