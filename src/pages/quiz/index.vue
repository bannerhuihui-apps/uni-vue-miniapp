<template>
  <view class="quiz-root">
    <view class="quiz-bg-stack">
      <image class="quiz-bg-img" :src="IMG_QUESTION_BG" mode="aspectFill" aria-hidden="true" />
      <view class="quiz-bg-mask"></view>
    </view>

    <ZhiwoNavBar :title="navTitle" :layered="true" title-color="rgba(129,124,124,0.95)" />

    <view class="quiz-page-inner">
      <!-- 主内容滚动；「上一题」单独固底，避免题干/提示高度变化带动按钮位移 -->
      <scroll-view scroll-y class="quiz-scroll-main" enhanced :show-scrollbar="false">
        <view class="content" :class="{ 'content--quiz-four': isScoredFourChoice }">
          <!-- #ifdef MP-WEIXIN -->
          <view
            v-if="showQuizNativeAd"
            class="mode-ad-card mode-ad-card--native"
            :class="{ 'mode-ad-card--ready': quizNativeAdReady }"
            :style="{ minHeight: quizNativeAdReserveStyle }"
          >
            <ad-custom
              class="mode-native-ad"
              :class="{ 'mode-native-ad--ready': quizNativeAdReady }"
              :unit-id="QUIZ_NATIVE_AD_UNIT_ID"
              @load="onQuizNativeAdLoad"
              @error="onQuizNativeAdError"
            />
          </view>
          <!-- #endif -->

          <view class="pill-track">
            <view class="pill-fill" :class="{ 'pill-fill--full': pct >= 100 }" :style="{ width: pct + '%' }"></view>
            <view class="pill-label">进度：{{ progressCurrent }}/{{ progressTotal }}</view>
          </view>

          <view v-if="line.mutualHint" class="mutual-hint">在你看来，{{ line.mutualName }} 会更像哪一种？</view>
          <view class="question" :class="line.mutualHint ? 'after-hint' : 'from-pill'">{{ line.q }}</view>

          <!-- 黑化 / 桃花 / 花痴 / 本命颜色：每题四选一；MBTI：保持原版两按钮布局 -->
          <template v-if="isScoredFourChoice">
            <view
              v-for="(op, ox) in quadOptions"
              :key="ox"
              class="tap opt opt-quad"
              :class="`opt-quad--${ox}`"
              hover-class=""
              @tap="choose(ox)"
            >
              {{ op.text }}
            </view>
          </template>
          <template v-else>
            <view class="opt lemon tap" hover-class="" @tap="choose(0)">{{ line.a }}</view>
            <view class="opt mint tap" hover-class="" @tap="choose(1)">{{ line.b }}</view>
          </template>
        </view>
      </scroll-view>

      <view class="quiz-prev-bar">
        <view class="prev tap" :class="{ 'prev--disabled': qIndex <= 0 }" @tap="prev">上一题</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { IMG_QUESTION_BG } from "@/config/static-images";
import { QUIZ_NATIVE_AD_RESERVE_RPX, QUIZ_NATIVE_AD_UNIT_ID } from "@/config/ads";
import ZhiwoNavBar from "@/components/ZhiwoNavBar.vue";
import { darknessTrendQuestions } from "@/data/quiz-darkness-trend";
import { peachBlossomQuestions } from "@/data/quiz-peach-blossom";
import { crushIndexQuestions } from "@/data/quiz-crush-index";
import { birthColorQuestions } from "@/data/quiz-birth-color";
import type { QuizQuestion } from "@/state/minigame-app";
import { minigameApp, type SessionQuizId } from "@/state/minigame-app";
import {
  buildDarknessQuizQuestions,
  settleDarknessTrendAnswers,
} from "@/utils/minigame/darkness-quiz-adapter";
import {
  buildPeachQuizQuestions,
  settlePeachBlossomAnswers,
} from "@/utils/minigame/peach-quiz-adapter";
import { buildMbtiType } from "@/utils/minigame/mbti";
import { hasUsableWechatProfile } from "@/utils/minigame/profile-guard";
import { flushPendingQuizSubmit } from "@/utils/minigame/persist-quiz";
import { shuffleQuizQuestionOptions } from "@/utils/minigame/shuffle-quiz-options";
import { getMutualQuizNavTitle } from "@/utils/minigame/invite-share";
import {
  isUiPreviewQuery,
  parsePreviewQuestionIndex,
  parsePreviewQuizId,
  seedMutualInvitePreview,
  UI_PREVIEW_INVITE_ID,
} from "@/utils/minigame/ui-preview";
import { settleCrushIndexAnswers } from "@/utils/minigame/crush-quiz-adapter";
import { settleBirthColorAnswers } from "@/utils/minigame/birth-color-quiz-adapter";

interface LineUi {
  q: string;
  a: string;
  b: string;
  progressCurrent: number;
  progressTotal: number;
  pct: number;
  mutualHint: boolean;
  mutualName: string;
}

const EMPTY_LINE: LineUi = {
  q: "",
  a: "",
  b: "",
  progressCurrent: 0,
  progressTotal: 0,
  pct: 0,
  mutualHint: false,
  mutualName: "",
};

const qIndex = ref(0);
const quizMode = ref<"self" | "mutual">("self");
const quizReady = ref(false);
const quizNativeAdVisible = ref(!!QUIZ_NATIVE_AD_UNIT_ID);
const quizNativeAdReady = ref(false);
const navTitle = ref("性格测试");

const inviteIdBridge = ref("");
const uiPreview = ref(false);
/** 本场套题（与首页 sessionQuizId 一致；须 ref 以便模板分流 UI） */
const effectiveQuizId = ref<SessionQuizId>("mbti");
let questionsPool: QuizQuestion[] = [];
const answersRef = ref<string[]>([]);

const isScoredFourChoice = computed(
  () =>
    effectiveQuizId.value === "darkness_trend" ||
    effectiveQuizId.value === "peach_blossom" ||
    effectiveQuizId.value === "crush_index" ||
    effectiveQuizId.value === "birth_color",
);

/** 黑化 / 桃花 / 花痴 / 本命颜色当前题的四枚选项（不改变 MBTI 的 line.a / line.b） */
const quadOptions = computed((): NonNullable<QuizQuestion["options"]> => {
  if (!isScoredFourChoice.value || !quizReady.value || !questionsPool.length) return [];
  const qi = Math.min(Math.max(qIndex.value, 0), questionsPool.length - 1);
  const opts = questionsPool[qi]?.options;
  return Array.isArray(opts) && opts.length >= 4 ? opts.slice(0, 4) : [];
});

function inviteTargetName(): string {
  const inv = minigameApp.invite || {};
  return String(inv.targetName || inv.ownerNickName || "").trim();
}

function patchFromQuestion(q: QuizQuestion | undefined, index: number, total: number, mode: string): LineUi {
  const progressPercent = total ? Math.round(((index + 1) / total) * 100) : 0;
  const opt0 = q?.options?.[0];
  const opt1 = q?.options?.[1];
  const tName = inviteTargetName();
  return {
    q: q?.text ?? "",
    a: opt0?.text ?? "",
    b: opt1?.text ?? "",
    progressCurrent: total ? index + 1 : 0,
    progressTotal: total,
    pct: progressPercent,
    mutualHint: mode === "mutual" && !!tName,
    mutualName: tName,
  };
}

onLoad((q) => {
  const query = (q || {}) as Record<string, unknown>;
  uiPreview.value = isUiPreviewQuery(query);

  const inviteId = q?.inviteId ? decodeURIComponent(String(q.inviteId)) : "";
  inviteIdBridge.value =
    inviteId.trim() ||
    (uiPreview.value ? UI_PREVIEW_INVITE_ID : "");
  const mode =
    q?.mode === "mutual" || (inviteIdBridge.value && q?.mode !== "self") ? "mutual" : "self";
  quizMode.value = mode === "mutual" ? "mutual" : "self";

  if (uiPreview.value && quizMode.value === "mutual") {
    seedMutualInvitePreview(parsePreviewQuizId(query));
  }

  if (quizMode.value === "mutual" && inviteIdBridge.value.trim()) {
    const id = inviteIdBridge.value.trim();
    const existing = String((minigameApp.invite as { inviteId?: string } | null)?.inviteId || "").trim();
    if (!existing) minigameApp.invite = { ...(minigameApp.invite || {}), inviteId: id };
  }

  const quizParamRaw = q?.quizId ? decodeURIComponent(String(q.quizId)).trim() : "";
  let resolved: SessionQuizId = minigameApp.sessionQuizId;
  if (quizParamRaw) {
    const s = quizParamRaw.toLowerCase();
    if (s === "darkness_trend") resolved = "darkness_trend";
    else if (s === "peach_blossom") resolved = "peach_blossom";
    else if (s === "crush_index") resolved = "crush_index";
    else if (s === "birth_color") resolved = "birth_color";
    else resolved = "mbti";
  }
  effectiveQuizId.value = resolved;
  minigameApp.sessionQuizId = resolved;

  let pool: QuizQuestion[] = [];
  const perspective = quizMode.value === "mutual" ? ("friend" as const) : ("self" as const);

  if (resolved === "darkness_trend") {
    navTitle.value = "黑化趋势测试";
    pool = buildDarknessQuizQuestions(darknessTrendQuestions, perspective);
  } else if (resolved === "peach_blossom") {
    navTitle.value = "桃花体质测试";
    pool = buildPeachQuizQuestions(peachBlossomQuestions, perspective);
  } else if (resolved === "crush_index") {
    navTitle.value = "花痴指数测试";
    pool = buildPeachQuizQuestions(crushIndexQuestions, perspective);
  } else if (resolved === "birth_color") {
    navTitle.value = "本命颜色测试";
    pool = buildPeachQuizQuestions(birthColorQuestions, perspective);
  } else {
    navTitle.value = "性格测试";
    const poolSelf =
      (Array.isArray(minigameApp.selfTestQuestions) && minigameApp.selfTestQuestions.length
        ? minigameApp.selfTestQuestions
        : []) as QuizQuestion[];

    const poolMut =
      (Array.isArray(minigameApp.mutualTestQuestions) && minigameApp.mutualTestQuestions.length
        ? minigameApp.mutualTestQuestions
        : poolSelf.slice()) as QuizQuestion[];

    pool = quizMode.value === "mutual" ? poolMut.slice() : poolSelf.slice();
  }

  if (quizMode.value === "mutual") {
    navTitle.value = getMutualQuizNavTitle(resolved, inviteTargetName());
  }

  questionsPool = shuffleQuizQuestionOptions(pool);
  qIndex.value = 0;
  answersRef.value = [];

  if (!questionsPool.length) {
    uni.showToast({ title: "题库为空，请重启小程序后再试", icon: "none", duration: 3000 });
    quizReady.value = false;
    return;
  }

  if (uiPreview.value) {
    const jump = parsePreviewQuestionIndex(query);
    if (jump > 0) {
      qIndex.value = Math.min(jump, questionsPool.length - 1);
    }
  }

  quizReady.value = true;
});

const line = computed((): LineUi => {
  if (!quizReady.value || !questionsPool.length) return EMPTY_LINE;
  const qi = Math.min(Math.max(qIndex.value, 0), questionsPool.length - 1);
  const qt = questionsPool[qi];
  return patchFromQuestion(qt, qi, questionsPool.length, quizMode.value);
});

const progressCurrent = computed(() => line.value.progressCurrent);
const progressTotal = computed(() => line.value.progressTotal);
const pct = computed(() => line.value.pct);
const showQuizNativeAd = computed(() => !!QUIZ_NATIVE_AD_UNIT_ID && quizNativeAdVisible.value);
const quizNativeAdReserveStyle = `${QUIZ_NATIVE_AD_RESERVE_RPX}rpx`;

function onQuizNativeAdLoad() {
  quizNativeAdVisible.value = true;
  quizNativeAdReady.value = true;
}

function onQuizNativeAdError(e: unknown) {
  quizNativeAdVisible.value = false;
  quizNativeAdReady.value = false;
  if (import.meta.env.DEV) {
    console.warn("[quiz] native ad load failed", e);
  }
}

function choose(optionIndex: number) {
  if (!quizReady.value) return;
  const q = questionsPool[qIndex.value];
  const opt = q?.options?.[optionIndex];
  if (!opt) return;

  const nextAnswers = [...answersRef.value];
  nextAnswers[qIndex.value] = opt.letter || "";
  answersRef.value = nextAnswers;

  if (qIndex.value >= questionsPool.length - 1) {
    let result: { type: string; counts: Record<string, number> };
    if (effectiveQuizId.value === "darkness_trend") {
      result = settleDarknessTrendAnswers(
        answersRef.value.slice(),
        darknessTrendQuestions,
        quizMode.value === "mutual",
      );
    } else if (effectiveQuizId.value === "peach_blossom") {
      result = settlePeachBlossomAnswers(answersRef.value.slice(), peachBlossomQuestions);
    } else if (effectiveQuizId.value === "crush_index") {
      result = settleCrushIndexAnswers(answersRef.value.slice(), crushIndexQuestions);
    } else if (effectiveQuizId.value === "birth_color") {
      result = settleBirthColorAnswers(answersRef.value.slice(), birthColorQuestions);
    } else {
      result = buildMbtiType(answersRef.value.slice());
    }
    minigameApp.currentResult = result;
    minigameApp.lastQuizContext = {
      mode: quizMode.value,
      inviteId: inviteIdBridge.value || "",
      quizId: effectiveQuizId.value,
    };

    minigameApp.pendingQuizPersist = {
      mode: quizMode.value,
      answers: answersRef.value.slice(),
      result,
      inviteId: inviteIdBridge.value || "",
      quizId: effectiveQuizId.value,
      createdAt: Date.now(),
    };

    if (uiPreview.value) {
      uni.redirectTo({
        url: `/pages/result/index?preview=1&quizId=${encodeURIComponent(effectiveQuizId.value)}`,
      });
      return;
    }

    const canPersist =
      minigameApp.authStatus === "success" &&
      minigameApp.userId &&
      hasUsableWechatProfile(minigameApp.profile);

    if (!canPersist) {
      const step = minigameApp.authStatus === "success" && minigameApp.userId ? "profile" : "login";
      uni.redirectTo({
        url: `/pages/records-auth-hint/index?purpose=quiz&step=${step}`,
      });
      return;
    }

    flushPendingQuizSubmit()
      .then(() => uni.redirectTo({ url: "/pages/result/index" }))
      .catch(() => uni.redirectTo({ url: "/pages/result/index" }));
    return;
  }

  qIndex.value += 1;
}

function prev() {
  if (qIndex.value <= 0) return;
  const prevIdx = qIndex.value - 1;
  answersRef.value = answersRef.value.slice(0, prevIdx);
  qIndex.value = prevIdx;
}
</script>

<style lang="scss" scoped>
.quiz-root {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  background: var(--qy-page-tint);
}

.quiz-bg-stack {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.quiz-bg-img {
  width: 100%;
  height: 100%;
  display: block;
}

.quiz-bg-mask {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
}

.quiz-page-inner {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  --quiz-prev-bar-h: calc(112rpx + env(safe-area-inset-bottom, 0px));
}

/** 题干区可滚动；「上一题」固定在底部栏，不随题目高度跳动 */
.quiz-scroll-main {
  flex: 1;
  min-height: 0;
  height: 0;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.content {
  position: relative;
  z-index: 1;
  padding: 16rpx 36rpx 32rpx;
  padding-bottom: calc(32rpx + var(--quiz-prev-bar-h));
  box-sizing: border-box;
}

.content--quiz-four {
  padding-bottom: calc(48rpx + var(--quiz-prev-bar-h));

  .mutual-hint {
    margin-top: 72rpx;
    margin-bottom: 40rpx;
    font-size: 30rpx;
  }

  .question {
    font-size: 44rpx;
    line-height: 1.4;
  }

  .question.from-pill {
    margin-top: 72rpx;
  }

  .opt-quad {
    margin-top: 28rpx;
    min-height: auto;
    font-size: 30rpx;
    line-height: 1.45;
    padding: 20rpx 28rpx;
  }

  .opt-quad:first-of-type {
    margin-top: 32rpx;
  }
}

.mode-ad-card--native {
  /* 先占位、再填充；不可用 max-height 裁切广告 */
  margin-top: 8rpx;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  border-radius: 24rpx;
  overflow: hidden;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.42);
  transition: background-color 180ms ease;
}

.mode-ad-card--native.mode-ad-card--ready {
  background: transparent;
}

.mode-native-ad {
  display: block;
  width: 100%;
  opacity: 0;
  transition: opacity 180ms ease;
}

.mode-native-ad--ready {
  opacity: 1;
}

.pill-track {
  position: relative;
  margin: 44rpx auto 0;
  width: calc(100% - 160rpx);
  max-width: 600rpx;
  height: 104rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.7);
  border: 2rpx solid rgba(160, 215, 194, 0.95);
  box-shadow: 0 16rpx 32rpx rgba(0, 0, 0, 0.12);
  overflow: hidden;
  box-sizing: border-box;
}

.pill-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 52rpx 0 0 52rpx;
  background: linear-gradient(
    90deg,
    rgba(198, 240, 219, 0.85) 0%,
    rgba(255, 245, 206, 0.8) 100%
  );
  max-width: 100%;
  transition: width 180ms linear;
}

.pill-fill--full {
  border-radius: 999rpx;
}

.pill-label {
  position: relative;
  z-index: 1;
  height: 104rpx;
  line-height: 104rpx;
  text-align: center;
  font-size: 48rpx;
  font-weight: 700;
  color: rgba(129, 124, 124, 0.95);
}

.mutual-hint {
  margin-top: 104rpx;
  margin-bottom: 56rpx;
  font-size: 34rpx;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.55);
}

.question {
  font-size: 56rpx;
  line-height: 1.35;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
}

.question.from-pill {
  margin-top: 104rpx;
}

.question.after-hint {
  margin-top: 0;
}

.opt {
  margin-top: 44rpx;
  border-radius: 999rpx;
  min-height: 156rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.55);
  border: 2rpx solid rgba(255, 255, 255, 0.9);
  font-size: 44rpx;
  font-weight: 700;
  line-height: 1.35;
  white-space: normal;
  padding: 24rpx 40rpx;
  box-sizing: border-box;
  text-align: center;
}

.opt.lemon {
  background: rgba(255, 245, 206, 0.95);
}

.opt.mint {
  background: rgba(198, 240, 219, 0.92);
}

.opt-quad {
  margin-top: 44rpx;
}

.opt-quad--0 {
  background: rgba(255, 245, 206, 0.95);
}

.opt-quad--1 {
  background: rgba(198, 240, 219, 0.92);
}

.opt-quad--2 {
  background: rgba(255, 245, 206, 0.95);
}

.opt-quad--3 {
  background: rgba(198, 240, 219, 0.92);
}

.quiz-prev-bar {
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  width: 100%;
  min-height: var(--quiz-prev-bar-h);
  padding: 8rpx 36rpx 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    to top,
    rgba(247, 242, 223, 0.96) 0%,
    rgba(247, 242, 223, 0.88) 55%,
    rgba(247, 242, 223, 0) 100%
  );
}

.prev {
  min-height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  color: rgba(129, 124, 124, 0.9);
  font-size: 44rpx;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: rgba(129, 124, 124, 0.85);
  text-underline-offset: 10rpx;
}

.prev--disabled {
  opacity: 0.35;
  pointer-events: none;
}

.tap:active {
  opacity: 0.92;
}
</style>
