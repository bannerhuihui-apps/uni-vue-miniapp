<template>
  <view class="page page--zhiwo" :style="pageStyle">
    <image class="layer-bg" :src="IMG_INDEX_BG" mode="aspectFill" />

    <view v-if="showMain" class="ui-main" :style="uiMainStyle">
      <!-- 从选题页等子页栈进入时需可返回；本页曾为入口时栈深为 1，不展示 -->
      <view
        v-if="showBack"
        class="index-back-row tap"
        :style="{ paddingTop: `${statusBarPx}px` }"
        aria-role="button"
        @tap="onBack"
      >
        <view class="index-back-hit">
          <view class="index-back-icon" />
        </view>
      </view>

      <view class="gear-wrap" :style="gearWrapStyle" @tap="goSettings">
        <view class="gear-circle gear-circle--light">
          <image class="gear-icon" :src="IMG_SETTINGS" mode="aspectFit" />
        </view>
      </view>

      <view class="hero-zone" :style="heroZoneStyle">
        <view class="brand-substack">
          <view class="hub-copy-above">
            <view class="hub-copy-line hub-copy-line--left" aria-hidden="true" />
            <text class="hub-section-label">{{ hubLine1 }}</text>
            <view class="hub-copy-line hub-copy-line--right" aria-hidden="true" />
          </view>

          <view
            class="hub-carousel"
            @touchstart="onCarouselTouchStart"
            @touchend="onCarouselTouchEnd"
            @touchcancel="onCarouselTouchCancel"
          >
            <view class="hub-carousel-track">
              <view
                v-for="(item, idx) in carouselItems"
                :key="item.quizId"
                class="hub-carousel-card tap"
                :class="carouselCardOffsetClass(idx)"
                @tap="selectCarouselItem(item.quizId)"
              >
                <image class="hub-carousel-img" :src="item.src" mode="aspectFill" />
              </view>
            </view>

            <view
              class="hub-carousel-arrow hub-carousel-arrow--prev tap"
              :class="{ 'is-disabled': !carouselLoopEnabled }"
              aria-role="button"
              @tap="carouselPrev"
            >
              <view class="hub-carousel-arrow-icon hub-carousel-arrow-icon--left" />
            </view>

            <view
              class="hub-carousel-arrow hub-carousel-arrow--next tap"
              :class="{ 'is-disabled': !carouselLoopEnabled }"
              aria-role="button"
              @tap="carouselNext"
            >
              <view class="hub-carousel-arrow-icon hub-carousel-arrow-icon--right" />
            </view>
          </view>

          <view class="hub-copy-below">
            <text class="hub-quiz-name">{{ hubLine2 }}</text>
          </view>
        </view>
      </view>

      <view class="footer-block" :style="footerBlockStyle">
        <view class="footer-actions">
          <view class="footer-actions__left">
            <view class="btn-main tap" @tap="startSelf">开始自测</view>
            <view class="btn-main tap" :class="{ 'is-disabled': !canStartMutualFriend }" @tap="startMutualFriend">
              朋友测评
            </view>
          </view>
          <view class="btn-main btn-main--ai tap" @tap="openAiAnalysis">
            <view class="btn-main--ai__stack">
              <text class="btn-main--ai__tag">AI</text>
              <text class="btn-main--ai__label">综合\n分析</text>
            </view>
          </view>
        </view>
        <view class="footer-bottom">
          <view class="link-row">
            <view class="link-t tap" hover-class="link-t--active" @tap="openRecords">测试记录</view>
            <view class="link-t tap" hover-class="link-t--active" @tap="openInfo">{{ infoLinkLabel }}</view>
          </view>
          <view class="notice-line">测试结果仅供娱乐，不具有任何指向性及指导性，请玩家适度娱乐。</view>
        </view>
      </view>
    </view>

    <!-- 与 zhiwo 首页一致：登录/拉取记录期间展示过渡，避免白屏 -->
    <ZhiwoBootLoading v-if="showLoading" @settings="goSettings" />

    <view v-if="aiGateModalVisible" class="ai-gate-modal">
      <view class="ai-gate-modal__mask tap" @tap="closeAiGateModal"></view>
      <view class="ai-gate-modal__panel" @tap.stop="">
        <text class="ai-gate-modal__title">提示</text>
        <text class="ai-gate-modal__msg">{{ aiGateModalMsg }}</text>
        <view class="ai-gate-modal__actions">
          <view class="ai-gate-modal__btn ai-gate-modal__btn--ghost tap" @tap="closeAiGateModal">知道了</view>
          <view class="ai-gate-modal__btn ai-gate-modal__btn--sample tap" @tap="openAiSampleReport">查看示例</view>
        </view>
      </view>
    </view>

    <AiReportSampleOverlay :visible="aiSampleVisible" @close="closeAiSampleOverlay" />
  </view>
</template>

<script setup lang="ts">
import { onLoad, onShow, onUnload } from "@dcloudio/uni-app";
import { computed, ref } from "vue";
import { IMG_INDEX_BG, IMG_SETTINGS } from "@/config/static-images";
import ZhiwoBootLoading from "@/components/ZhiwoBootLoading.vue";
import AiReportSampleOverlay from "@/components/AiReportSampleOverlay.vue";
import { AI_REPORT_SAMPLE_CONTENT } from "@/data/ai-report-sample";
import { indexHubCarousel, getIndexHubCarouselLabel, getIndexHubInfoLinkLabel } from "@/data/index-hub-carousel";
import { minigameApp, type SessionQuizId } from "@/state/minigame-app";
import { hasUsableWechatProfile } from "@/utils/minigame/profile-guard";
import { hasSelfTestRecordForQuiz } from "@/utils/minigame/quiz-id";
import { resolveIndexHomeQuizId } from "@/utils/minigame/index-home";
import { readIndexHomeLayout } from "@/utils/minigame/index-home-layout";
import { mgAiEligibility } from "@/api/minigame";
import { AI_INELIGIBLE_MSG } from "@/utils/minigame/ai-analysis-gate";
import { readTopRightGearTopPx } from "@/utils/minigame/nav-chrome";

const carouselItems = indexHubCarousel;

const selectedQuizId = computed(() => minigameApp.sessionQuizId);

const selectedCarouselIdx = computed(() =>
  carouselItems.findIndex((item) => item.quizId === selectedQuizId.value),
);

const carouselLoopEnabled = computed(() => carouselItems.length > 1);

const CAROUSEL_SWIPE_THRESHOLD_PX = 36;

type CarouselTouchEvent = {
  touches?: Array<{ clientX?: number; pageX?: number; clientY?: number; pageY?: number }>;
  changedTouches?: Array<{ clientX?: number; pageX?: number; clientY?: number; pageY?: number }>;
};

let carouselTouchStartX = 0;
let carouselTouchStartY = 0;
let carouselTouchActive = false;
let carouselSwipeJustFired = false;

function readCarouselTouchXY(e: CarouselTouchEvent): { x: number; y: number } {
  const t = e.touches?.[0] ?? e.changedTouches?.[0];
  if (!t) return { x: 0, y: 0 };
  return { x: t.clientX ?? t.pageX ?? 0, y: t.clientY ?? t.pageY ?? 0 };
}

function onCarouselTouchStart(e: CarouselTouchEvent) {
  if (!carouselLoopEnabled.value) return;
  const { x, y } = readCarouselTouchXY(e);
  carouselTouchStartX = x;
  carouselTouchStartY = y;
  carouselTouchActive = true;
}

function onCarouselTouchEnd(e: CarouselTouchEvent) {
  if (!carouselTouchActive || !carouselLoopEnabled.value) {
    carouselTouchActive = false;
    return;
  }
  carouselTouchActive = false;

  const { x, y } = readCarouselTouchXY(e);
  const dx = x - carouselTouchStartX;
  const dy = y - carouselTouchStartY;
  if (Math.abs(dx) < CAROUSEL_SWIPE_THRESHOLD_PX || Math.abs(dx) <= Math.abs(dy)) return;

  carouselSwipeJustFired = true;
  if (dx < 0) carouselNext();
  else carouselPrev();
  setTimeout(() => {
    carouselSwipeJustFired = false;
  }, 320);
}

function onCarouselTouchCancel() {
  carouselTouchActive = false;
}

/** 环形最短距离：首尾相连，左右两侧始终有邻居 */
function circularCarouselOffset(idx: number, base: number, total: number): number {
  let diff = idx - base;
  const half = Math.floor(total / 2);
  if (diff > half) diff -= total;
  if (diff < -half) diff += total;
  return diff;
}

/** coverflow：相对选中项的层级与位移 class（环形） */
function carouselCardOffsetClass(idx: number): string {
  const base = selectedCarouselIdx.value;
  if (base < 0 || !carouselItems.length) return "hub-carousel-card--center";
  const offset = circularCarouselOffset(idx, base, carouselItems.length);
  if (offset === 0) return "hub-carousel-card--center";
  if (offset === -1) return "hub-carousel-card--left1";
  if (offset === 1) return "hub-carousel-card--right1";
  if (offset === -2) return "hub-carousel-card--left2";
  if (offset === 2) return "hub-carousel-card--right2";
  return "hub-carousel-card--hidden";
}

function selectCarouselItem(quizId: SessionQuizId) {
  if (carouselSwipeJustFired) return;
  minigameApp.sessionQuizId = quizId;
}

function carouselPrev() {
  const base = selectedCarouselIdx.value;
  if (base < 0 || !carouselLoopEnabled.value) return;
  const nextIdx = (base - 1 + carouselItems.length) % carouselItems.length;
  minigameApp.sessionQuizId = carouselItems[nextIdx].quizId;
}

function carouselNext() {
  const base = selectedCarouselIdx.value;
  if (base < 0 || !carouselLoopEnabled.value) return;
  const nextIdx = (base + 1) % carouselItems.length;
  minigameApp.sessionQuizId = carouselItems[nextIdx].quizId;
}

/** 与子页一致的顶部安全区高度，用于左上角返回触点 */
function readStatusBarPx(): number {
  try {
    const w = uni.getWindowInfo();
    if (w && typeof w.statusBarHeight === "number") return w.statusBarHeight;
  } catch {
    /* 低版本 / 非标准运行环境 */
  }
  try {
    return uni.getSystemInfoSync().statusBarHeight ?? 22;
  } catch {
    return 22;
  }
}

const statusBarPx = ref(readStatusBarPx());
const gearTopPx = ref(readTopRightGearTopPx());
const homeLayout = ref(readIndexHomeLayout());

const pageStyle = computed(() => ({
  height: `${homeLayout.value.windowHeightPx}px`,
  minHeight: `${homeLayout.value.windowHeightPx}px`,
}));

const uiMainStyle = computed(() => ({
  height: `${homeLayout.value.windowHeightPx}px`,
  minHeight: `${homeLayout.value.windowHeightPx}px`,
  paddingTop: `${homeLayout.value.safeTopPx}px`,
}));

const heroZoneStyle = computed(() => ({
  marginTop: `${homeLayout.value.heroMarginTopPx}px`,
}));

const footerBlockStyle = computed(() => ({
  paddingBottom: `${homeLayout.value.footerPaddingBottomPx}px`,
}));

const gearWrapStyle = computed(() => ({ top: `${gearTopPx.value}px` }));
const showBack = ref(false);
const showLoading = ref(minigameApp.authStatus === "loading");
const showMain = ref(minigameApp.authStatus !== "loading");
const aiGateModalVisible = ref(false);
const aiGateModalMsg = ref("");
const aiSampleVisible = ref(false);

function syncBootState() {
  showLoading.value = minigameApp.authStatus === "loading";
  showMain.value = minigameApp.authStatus !== "loading";
}

function onAuthResolved() {
  syncBootState();
}

onUnload(() => {
  uni.$off("minigame-auth-resolved", onAuthResolved);
});

uni.$on("minigame-auth-resolved", onAuthResolved);

onLoad((q) => {
  const raw =
    q != null && (q as { quizId?: string }).quizId != null
      ? decodeURIComponent(String((q as { quizId?: string }).quizId)).trim()
      : "";
  minigameApp.sessionQuizId = resolveIndexHomeQuizId(raw || undefined);
});

/** 首页主标题固定；轮播下方副标题随选中套题变化（MBTI 单独为「MBTI测试」） */
const hubLine1 = computed(() => "之性格测试");
const hubLine2 = computed(() =>
  minigameApp.sessionQuizId === "mbti" ? "MBTI测试" : getIndexHubCarouselLabel(minigameApp.sessionQuizId),
);

const infoLinkLabel = computed(() => getIndexHubInfoLinkLabel(minigameApp.sessionQuizId));

function syncNavChrome() {
  statusBarPx.value = readStatusBarPx();
  gearTopPx.value = readTopRightGearTopPx();
  homeLayout.value = readIndexHomeLayout();
  showBack.value = getCurrentPages().length > 1;
}

onShow(() => {
  syncNavChrome();
  syncBootState();
});

function onBack() {
  uni.navigateBack({ delta: 1 });
}

const canStartMutualFriend = computed(() =>
  hasSelfTestRecordForQuiz(minigameApp.records, minigameApp.sessionQuizId),
);

function goSettings() {
  uni.navigateTo({ url: "/pages/settings/index" });
}

function startSelf() {
  const qid = encodeURIComponent(minigameApp.sessionQuizId);
  uni.navigateTo({ url: `/pages/quiz/index?mode=self&quizId=${qid}` });
}

function startMutualFriend() {
  if (!canStartMutualFriend.value) {
    uni.showToast({
      title: `请先完成${getIndexHubCarouselLabel(minigameApp.sessionQuizId)}自测`,
      icon: "none",
    });
    return;
  }
  uni.navigateTo({ url: `/pages/invite/index?quizId=${encodeURIComponent(minigameApp.sessionQuizId)}` });
}

function openRecords() {
  if (minigameApp.authStatus !== "success") {
    uni.navigateTo({ url: "/pages/records-auth-hint/index?step=login" });
    return;
  }
  if (!hasUsableWechatProfile(minigameApp.profile)) {
    uni.navigateTo({ url: "/pages/records-auth-hint/index?step=profile" });
    return;
  }
  uni.navigateTo({ url: `/pages/records/index?quizId=${encodeURIComponent(minigameApp.sessionQuizId)}` });
}

function openInfo() {
  uni.navigateTo({
    url: `/pages/info/index?quizId=${encodeURIComponent(minigameApp.sessionQuizId)}`,
  });
}

async function openAiAnalysis() {
  if (minigameApp.authStatus !== "success" || !minigameApp.userId) {
    uni.navigateTo({ url: "/pages/records-auth-hint/index?step=login" });
    return;
  }
  if (!hasUsableWechatProfile(minigameApp.profile)) {
    uni.navigateTo({ url: "/pages/records-auth-hint/index?step=profile" });
    return;
  }

  try {
    uni.showLoading({ title: "检查中…", mask: true });
    const res = await mgAiEligibility(minigameApp.userId);
    uni.hideLoading();
    if (!res?.eligible) {
      aiGateModalMsg.value = res?.message || AI_INELIGIBLE_MSG;
      aiGateModalVisible.value = true;
      return;
    }
    uni.navigateTo({ url: "/pages/ai-analysis/index" });
  } catch (e) {
    uni.hideLoading();
    uni.showToast({
      title: e instanceof Error ? e.message : "检查失败",
      icon: "none",
    });
  }
}

function closeAiGateModal() {
  aiGateModalVisible.value = false;
}

function openAiSampleReport() {
  aiGateModalVisible.value = false;
  aiSampleVisible.value = true;
}

function closeAiSampleOverlay() {
  aiSampleVisible.value = false;
}
</script>

<style lang="scss">
.page--zhiwo {
  background: var(--qy-page-tint);
  position: relative;
  width: 100%;
  overflow: hidden;
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
  z-index: 4;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.index-back-row {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 8;
  padding-left: env(safe-area-inset-left);
  box-sizing: border-box;
}

.index-back-hit {
  min-height: 44px;
  display: flex;
  align-items: center;
  padding: 22rpx 36rpx 22rpx 32rpx;
  margin: -22rpx -36rpx -22rpx -32rpx;
  color: rgba(90, 86, 82, 0.9);
}

.index-back-icon {
  width: 24rpx;
  height: 48rpx;
  background-color: currentColor;
  -webkit-mask: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='24' viewBox='0 0 12 24'%3E%3Cpath fill-opacity='.9' fill-rule='evenodd' d='M10 19.438L8.955 20.5l-7.666-7.79a1.02 1.02 0 0 1 0-1.42L8.955 3.5 10 4.563 2.682 12 10 19.438z'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
  mask: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='24' viewBox='0 0 12 24'%3E%3Cpath fill-opacity='.9' fill-rule='evenodd' d='M10 19.438L8.955 20.5l-7.666-7.79a1.02 1.02 0 0 1 0-1.42L8.955 3.5 10 4.563 2.682 12 10 19.438z'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
  -webkit-mask-size: cover;
  mask-size: cover;
}

.gear-wrap {
  position: absolute;
  right: 40rpx;
  z-index: 6;
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

.hero-zone {
  flex-shrink: 0;
  padding: 0 40rpx;
  box-sizing: border-box;
  text-align: center;
}

.brand-substack {
  margin-top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.hub-copy-above {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  width: 100%;
  margin-top: -28rpx;
  margin-bottom: 16rpx;
  box-sizing: border-box;
}

.hub-copy-line {
  flex: 1;
  max-width: 80rpx;
  height: 2rpx;
  border-radius: 2rpx;
}

.hub-copy-line--left {
  background: linear-gradient(90deg, transparent 0%, rgba(140, 134, 130, 0.38) 100%);
}

.hub-copy-line--right {
  background: linear-gradient(90deg, rgba(140, 134, 130, 0.38) 0%, transparent 100%);
}

.hub-section-label {
  flex-shrink: 0;
  padding: 0 8rpx;
  font-size: 34rpx;
  line-height: 1.3;
  font-weight: 600;
  letter-spacing: 8rpx;
  color: rgba(118, 112, 106, 0.9);
}

.hub-copy-below {
  margin-top: 14rpx;
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
}

.hub-quiz-name {
  display: inline-block;
  max-width: 100%;
  padding: 0 40rpx;
  height: 76rpx;
  line-height: 76rpx;
  font-size: 46rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  color: rgba(108, 100, 92, 0.96);
  border-radius: 999rpx;
  background: linear-gradient(
    180deg,
    rgba(255, 253, 246, 0.94) 0%,
    rgba(255, 241, 214, 0.9) 100%
  );
  border: 2rpx solid rgba(201, 172, 118, 0.62);
  box-shadow:
    0 8rpx 20rpx rgba(120, 90, 50, 0.08),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.72);
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hub-carousel {
  position: relative;
  width: 100%;
  margin-top: 0;
  margin-bottom: 0;
  min-height: 208rpx;
  padding: 0 68rpx;
  box-sizing: border-box;
}

.hub-carousel-track {
  position: relative;
  width: 100%;
  height: 208rpx;
  perspective: 1400rpx;
  transform-style: preserve-3d;
}

.hub-carousel-card {
  position: absolute;
  left: 50%;
  top: 0;
  width: 208rpx;
  height: 208rpx;
  margin-left: -104rpx;
  border-radius: 28rpx;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.42);
  border: 2rpx solid rgba(255, 255, 255, 0.72);
  box-shadow: 0 8rpx 18rpx rgba(58, 50, 40, 0.1);
  box-sizing: border-box;
  transition:
    transform 0.34s cubic-bezier(0.22, 0.85, 0.28, 1),
    opacity 0.28s ease,
    box-shadow 0.28s ease;
  transform-origin: center center;
}

.hub-carousel-img {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 26rpx;
}

.hub-carousel-card--center {
  z-index: 5;
  opacity: 1;
  transform: translateX(0) scale(1.04) rotateY(0deg);
  border: 3rpx solid rgba(201, 172, 118, 0.95);
  box-shadow:
    0 20rpx 40rpx rgba(58, 50, 40, 0.24),
    0 8rpx 16rpx rgba(120, 90, 50, 0.14),
    inset 0 0 0 1rpx rgba(255, 255, 255, 0.6);
}

.hub-carousel-card--left1 {
  z-index: 4;
  opacity: 0.9;
  transform: translateX(-132rpx) scale(0.85) rotateY(10deg);
}

.hub-carousel-card--right1 {
  z-index: 4;
  opacity: 0.9;
  transform: translateX(132rpx) scale(0.85) rotateY(-10deg);
}

.hub-carousel-card--left2 {
  z-index: 3;
  opacity: 0.72;
  transform: translateX(-198rpx) scale(0.7) rotateY(12deg);
}

.hub-carousel-card--right2 {
  z-index: 3;
  opacity: 0.72;
  transform: translateX(198rpx) scale(0.7) rotateY(-12deg);
}

.hub-carousel-card--hidden {
  z-index: 1;
  opacity: 0;
  pointer-events: none;
  transform: translateX(0) scale(0.52);
}

.hub-carousel-card.tap:active {
  opacity: 0.86;
}

.hub-carousel-card--center.tap:active {
  opacity: 0.94;
}

.hub-carousel-arrow {
  position: absolute;
  top: 50%;
  z-index: 10;
  width: 48rpx;
  height: 88rpx;
  transform: translateY(-50%);
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(118, 112, 106, 0.82);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.62) 0%,
    rgba(255, 246, 220, 0.52) 100%
  );
  border: 2rpx solid rgba(201, 172, 118, 0.28);
  box-shadow: 0 4rpx 14rpx rgba(58, 50, 40, 0.05);
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.hub-carousel-arrow--prev {
  left: 4rpx;
}

.hub-carousel-arrow--next {
  right: 4rpx;
}

.hub-carousel-arrow.is-disabled {
  opacity: 0.22;
  pointer-events: none;
}

.hub-carousel-arrow.tap:active {
  opacity: 0.72;
}

.hub-carousel-arrow-icon {
  width: 14rpx;
  height: 26rpx;
  background-color: currentColor;
  opacity: 0.88;
  -webkit-mask: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='22' viewBox='0 0 12 22'%3E%3Cpath d='M10 2 L2 11 L10 20' fill='none' stroke='%23000' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
  mask: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='22' viewBox='0 0 12 22'%3E%3Cpath d='M10 2 L2 11 L10 20' fill='none' stroke='%23000' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
  -webkit-mask-size: contain;
  mask-size: contain;
}

.hub-carousel-arrow-icon--right {
  transform: scaleX(-1);
}

.footer-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 24rpx;
  min-height: 0;
  padding: 0 64rpx;
  box-sizing: border-box;
}

.footer-actions {
  flex-shrink: 0;
  margin-top: auto;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 20rpx;
  padding: 20rpx 22rpx;
  border-radius: 52rpx;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.52) 0%,
    rgba(255, 250, 236, 0.38) 100%
  );
  border: 2rpx solid rgba(255, 255, 255, 0.82);
  box-shadow: var(--qy-card-shadow);
  box-sizing: border-box;
}

.footer-actions__left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20rpx;
}

.footer-actions__left .btn-main {
  width: 100%;
}

.footer-actions__left .btn-main + .btn-main {
  margin-top: 0;
}

.btn-main {
  flex-shrink: 0;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 44rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
  color: rgba(118, 108, 98, 0.96);
  background: linear-gradient(180deg, #fffefb 0%, #fff7e8 52%, #ffefda 100%);
  border: 2rpx solid rgba(196, 168, 118, 0.58);
  box-shadow:
    0 8rpx 20rpx rgba(88, 68, 40, 0.08),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.82);
  box-sizing: border-box;
}

.btn-main.is-disabled {
  opacity: 1;
  color: rgba(140, 134, 130, 0.42);
  background: rgba(255, 255, 255, 0.42);
  border-color: rgba(196, 168, 118, 0.28);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.5);
}

.btn-main--ai {
  flex: 0 0 120rpx;
  width: 120rpx;
  height: 220rpx;
  min-height: 0;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 8rpx;
  border-radius: 26rpx;
  background: linear-gradient(180deg, #fffefb 0%, #fff7e8 52%, #ffefda 100%);
  border: 2rpx solid rgba(196, 168, 118, 0.58);
  box-shadow:
    0 8rpx 20rpx rgba(88, 68, 40, 0.08),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.82);
}

.btn-main--ai__stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
}

.btn-main--ai__tag {
  font-size: 30rpx;
  font-weight: 700;
  letter-spacing: 0;
  color: rgba(118, 108, 98, 0.96);
}

.btn-main--ai__label {
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.25;
  color: rgba(118, 108, 98, 0.96);
  text-align: center;
  white-space: pre-line;
}

.btn-main.tap:active,
.btn-main--ai.tap:active {
  transform: scale(0.985);
  opacity: 0.94;
}

.tap:active {
  opacity: 0.88;
}

.footer-bottom {
  flex-shrink: 0;
  margin-top: 32rpx;
}

.link-row {
  flex-shrink: 0;
  margin-top: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 20rpx;
}

.link-t {
  font-size: 48rpx;
  color: rgba(140, 134, 130, 0.95);
  text-decoration: underline;
  text-underline-offset: 10rpx;
  text-decoration-thickness: 2rpx;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.link-t--active {
  opacity: 0.72;
}

.btn-main,
.gear-wrap {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.notice-line {
  flex-shrink: 0;
  margin-top: 0;
  padding-top: 24rpx;
  text-align: center;
  font-size: 26rpx;
  line-height: 1.45;
  color: rgba(140, 134, 130, 0.95);
  padding-left: 12rpx;
  padding-right: 12rpx;
}

.ai-gate-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx 56rpx;
  box-sizing: border-box;
}

.ai-gate-modal__mask {
  position: absolute;
  inset: 0;
  background: rgba(40, 36, 32, 0.42);
}

.ai-gate-modal__panel {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 620rpx;
  padding: 40rpx 36rpx 32rpx;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 40rpx;
  border: 2rpx solid rgba(196, 168, 118, 0.35);
  box-shadow: var(--qy-card-shadow-modal);
}

.ai-gate-modal__title {
  display: block;
  text-align: center;
  font-size: 38rpx;
  font-weight: 700;
  color: rgba(72, 62, 52, 0.94);
  margin-bottom: 24rpx;
}

.ai-gate-modal__msg {
  display: block;
  font-size: 30rpx;
  line-height: 1.62;
  color: var(--qy-text-mute);
  text-align: center;
  padding: 0 8rpx;
}

.ai-gate-modal__actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 36rpx;
}

.ai-gate-modal__btn {
  height: 96rpx;
  line-height: 96rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 34rpx;
  font-weight: 600;
  box-sizing: border-box;
}

.ai-gate-modal__btn--ghost {
  color: rgba(118, 108, 98, 0.88);
  background: rgba(255, 255, 255, 0.72);
  border: 2rpx solid rgba(196, 168, 118, 0.38);
}

.ai-gate-modal__btn--sample {
  color: var(--qy-link-strong);
  background: var(--qy-lemon);
  border: 2rpx solid var(--qy-card-stroke);
  box-shadow: 0 8rpx 20rpx rgba(88, 68, 40, 0.08);
}
</style>
