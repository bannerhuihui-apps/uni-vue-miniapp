<template>
  <view class="page z-hint">
    <image class="bg" :src="IMG_QUESTION_BG" mode="aspectFill" />
    <view class="mask"></view>

    <view class="stack">
      <ZhiwoNavBar :title="navTitle" title-color="rgba(0,0,0,0.72)" />
      <view class="subtitle">{{ subtitle }}</view>

      <scroll-view scroll-y enhanced class="main-scroll" :show-scrollbar="false">
        <view class="hint-card">
          <view class="hint-pill">{{ pillText }}</view>
          <text class="hint-headline">{{ headline }}</text>
          <text v-for="(line, idx) in bodyLines" :key="idx" class="hint-body">{{ line }}</text>

          <view v-if="step === 'profile'" class="profile-inline">
            <text class="profile-inline-title">选择头像 · 昵称</text>
            <text class="profile-placeholder">
              请在独立页中选择头像并填写昵称，保存后会回到你要去的页面（演示数据仅存本机）。
            </text>
            <view class="profile-go-row tap" @tap="goProfileSetup">去填写头像昵称</view>
          </view>

          <text v-if="authTip" class="hint-footnote-muted">{{ authTip }}</text>

          <text class="hint-footnote">
            本说明面向「读取个人测试记录」；测试结果仅供娱乐交流，不具有任何指向性及指导性。
          </text>
        </view>
        <view class="scroll-footer-spacer"></view>
      </scroll-view>

      <view v-if="step === 'login'" class="bottom-actions safe-bottom">
        <view class="btn-login tap" @tap="onDemoLogin">{{ loginBtn }}</view>
        <view class="btn-home-lemon tap" @tap="goHome">返回首页</view>
      </view>

      <view v-if="step === 'profile'" class="bottom-actions safe-bottom">
        <view class="btn-login tap" @tap="goProfileSetup">填写头像昵称</view>
        <view class="btn-home-lemon tap" @tap="goHome">返回首页</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { IMG_QUESTION_BG } from "@/config/static-images";
import ZhiwoNavBar from "@/components/ZhiwoNavBar.vue";
import { minigameApp, type SessionQuizId } from "@/state/minigame-app";
import { coerceRecordQuizId } from "@/utils/minigame/quiz-id";
import { redirectToIndexHome, reLaunchIndexHome } from "@/utils/minigame/index-home";
import { ensureLogin } from "@/utils/minigame/session";
import { flushPendingQuizSubmit } from "@/utils/minigame/persist-quiz";
import { hasUsableWechatProfile } from "@/utils/minigame/profile-guard";

const STEP_LOGIN = "login";
const STEP_PROFILE = "profile";
const PURPOSE_QUIZ = "quiz";
const PURPOSE_RECORDS = "records";

const purpose = ref(PURPOSE_RECORDS);
const step = ref<"login" | "profile">("login");
const logging = ref(false);
const authTip = ref("");

const navTitle = ref("测试记录");
const pillText = ref("STEP 登录");
const subtitle = ref("");
const headline = ref("");
const bodyLines = ref<string[]>([]);
const loginBtn = ref("微信登录并继续");
const recordsQuizId = ref<SessionQuizId>("mbti");

function recordsUrl(): string {
  return `/pages/records/index?quizId=${encodeURIComponent(recordsQuizId.value)}`;
}

function isQuiz() {
  return purpose.value === PURPOSE_QUIZ;
}

function applyCopy() {
  const p = purpose.value;
  const s = step.value;
  if (p === PURPOSE_QUIZ) {
    if (s === STEP_PROFILE) {
      navTitle.value = "保存测试结果";
      pillText.value = "完善昵称与头像";
      subtitle.value = "您已登录。请选择头像并填写昵称，以完成本次测评的云端保存。";
      headline.value = "保存后即可进入测试结果页（自测会出现在测试记录中）";
      bodyLines.value = [
        "为保护数据与您本人对应，我们会在您确认后写入本次答题结果。",
        "互测作答将发给邀请的好友；自测将作为一条新记录记入您的云端档案。",
        "点击下方按钮保存后稍候即可跳转结果页。",
      ];
      loginBtn.value = "微信登录并保存结果";
    } else {
      navTitle.value = "保存测试结果";
      pillText.value = "保存测评结果";
      subtitle.value = "您已完成本题测评。若要生成结果页并写入账号，需要先完成登录。";
      headline.value = "登录后还需授权头像与昵称，系统将为您保存这次作答";
      bodyLines.value = [
        "在您完成授权前，测试结果仅记录在本地流程中：需要登录确认账号归属后，才能把这次自测或互测结果安全写入服务端。",
        "若您已通过静默登录但未填写过头像昵称，还需再完成所选头像与非占位昵称的授权，我们才能提交互测或写入您的测试记录。",
        "本步骤不收集手机号码。请点击下方按钮发起微信登录。",
      ];
      loginBtn.value = "微信登录并保存结果";
    }
    return;
  }
  if (s === STEP_PROFILE) {
    navTitle.value = "测试记录";
    pillText.value = "完善昵称与头像";
    subtitle.value = "您已登录，还需授权头像与昵称才能查看云端测试记录";
    headline.value = "请在下框中选择头像并填写昵称，完成身份信息确认";
    bodyLines.value = [
      "系统在收到您授权的头像与昵称之前，无法在「测试记录」页面向您展示与个人绑定的云端数据。",
      "头像与昵称由您主动选择与填写，我们不会在此向您索要手机号码。",
      "点击下方「保存并查看记录」后，将进入您的测试记录列表。",
    ];
    loginBtn.value = "微信登录并继续";
  } else {
    navTitle.value = "测试记录";
    pillText.value = "查看记录须知";
    subtitle.value = "请先完成账号登录：测试记录与个人身份绑定存放在云端。";
    headline.value = "完成登录后，还需授权头像与昵称，才可查看您的测试记录";
    bodyLines.value = [
      "「测试记录」中的自测与互测信息与您的微信号对应的服务端账号相关联，需要先通过微信登录校验，确认当前设备上的会话。",
      "仅完成静默登录还不够：为把记录准确归属给您本人（并便于互测等场景中展示发起人），微信平台还需要您在选择「测试记录」时主动填写头像与昵称。",
      "若您暂未登录账号，请先点击下方按钮发起微信登录。",
    ];
    loginBtn.value = "微信登录并继续";
  }
}

function syncAuthTip() {
  const err = minigameApp.authError;
  authTip.value = err && minigameApp.authStatus === "fail" ? String(err).slice(0, 220) : "";
}

function goAfterGateSuccess() {
  if (isQuiz()) {
    if (!minigameApp.pendingQuizPersist) {
      uni.showToast({ title: "暂无待保存的作答", icon: "none" });
      redirectToIndexHome(minigameApp.lastQuizContext?.quizId || minigameApp.sessionQuizId);
      return;
    }
    flushPendingQuizSubmit()
      .then(() => uni.redirectTo({ url: "/pages/result/index" }))
      .catch(() => uni.redirectTo({ url: "/pages/result/index" }));
    return;
  }
  uni.redirectTo({ url: recordsUrl() });
}

onLoad((q) => {
  const p = (q?.purpose as string) === PURPOSE_QUIZ ? PURPOSE_QUIZ : PURPOSE_RECORDS;
  const s = (q?.step as string) === STEP_PROFILE ? STEP_PROFILE : STEP_LOGIN;
  purpose.value = p;
  step.value = s;
  const rawQuiz = q?.quizId ? decodeURIComponent(String(q.quizId)).trim() : "";
  recordsQuizId.value = rawQuiz ? coerceRecordQuizId(rawQuiz) : minigameApp.sessionQuizId;
  applyCopy();
});

onShow(() => {
  const ok = minigameApp.authStatus === "success" && hasUsableWechatProfile(minigameApp.profile);

  if (isQuiz()) {
    if (ok && minigameApp.pendingQuizPersist) {
      flushPendingQuizSubmit()
        .then(() => uni.redirectTo({ url: "/pages/result/index" }))
        .catch(() => uni.redirectTo({ url: "/pages/result/index" }));
      return;
    }
    if (ok && !minigameApp.pendingQuizPersist) {
      redirectToIndexHome(minigameApp.lastQuizContext?.quizId || minigameApp.sessionQuizId);
      return;
    }
  } else if (ok) {
    uni.redirectTo({ url: recordsUrl() });
    return;
  }

  if (minigameApp.authStatus !== "success") {
    if (step.value !== STEP_LOGIN) {
      step.value = STEP_LOGIN;
      applyCopy();
    }
  } else if (!hasUsableWechatProfile(minigameApp.profile)) {
    if (step.value !== STEP_PROFILE) {
      step.value = STEP_PROFILE;
      applyCopy();
    }
  }

  syncAuthTip();
});

function goProfileSetup() {
  const back = `/pages/records-auth-hint/index?purpose=${encodeURIComponent(purpose.value)}&step=profile&quizId=${encodeURIComponent(recordsQuizId.value)}`;
  uni.navigateTo({ url: `/pages/profile-setup/index?redirect=${encodeURIComponent(back)}` });
}

function onDemoLogin() {
  if (logging.value) return;
  logging.value = true;
  ensureLogin(true)
    .then(() => {
      if (minigameApp.authStatus !== "success") {
        syncAuthTip();
        uni.showToast({ title: minigameApp.authError || "登录未完成", icon: "none" });
        return;
      }
      if (hasUsableWechatProfile(minigameApp.profile)) {
        goAfterGateSuccess();
      } else {
        step.value = STEP_PROFILE;
        applyCopy();
      }
    })
    .catch(() => {
      syncAuthTip();
      uni.showToast({ title: minigameApp.authError || "登录失败，请重试", icon: "none" });
    })
    .finally(() => {
      logging.value = false;
    });
}

function goHome() {
  if (isQuiz()) minigameApp.pendingQuizPersist = null;
  reLaunchIndexHome(
    isQuiz()
      ? minigameApp.lastQuizContext?.quizId || minigameApp.sessionQuizId
      : recordsQuizId.value,
  );
}
</script>

<style lang="scss" scoped>
.z-hint.page {
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

.subtitle {
  padding: 8rpx 40rpx 20rpx;
  font-size: 32rpx;
  line-height: 1.4;
  color: var(--qy-text-mute);
}

.main-scroll {
  flex: 1;
  min-height: 0;
  height: 0;
  padding: 0 40rpx;
  box-sizing: border-box;
}

.hint-card {
  padding: 36rpx 36rpx 40rpx;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.74);
  border-radius: 48rpx;
  border: 2rpx solid var(--qy-card-stroke);
  box-shadow: var(--qy-card-shadow);
}

.hint-pill {
  display: inline-block;
  padding: 0 24rpx;
  height: 56rpx;
  line-height: 56rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  background: linear-gradient(90deg, rgba(213, 241, 228, 0.98), rgba(255, 241, 207, 0.98));
  border: 2rpx solid rgba(176, 214, 198, 0.65);
}

.hint-headline {
  display: block;
  margin-top: 28rpx;
  font-size: 42rpx;
  font-weight: 700;
  line-height: 1.38;
  color: rgba(0, 0, 0, 0.82);
}

.hint-body {
  display: block;
  margin-top: 24rpx;
  font-size: 34rpx;
  line-height: 50rpx;
  color: rgba(0, 0, 0, 0.62);
}

.profile-inline {
  margin-top: 32rpx;
  padding-top: 28rpx;
  border-top: 2rpx solid rgba(224, 214, 182, 0.65);
}

.profile-inline-title {
  display: block;
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
  color: rgba(32, 32, 32, 0.9);
  margin-bottom: 16rpx;
}

.profile-placeholder {
  display: block;
  text-align: center;
  font-size: 28rpx;
  line-height: 1.55;
  color: var(--qy-text-mute);
}

.profile-go-row {
  margin-top: 28rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 34rpx;
  font-weight: 700;
  background: rgba(214, 241, 228, 0.65);
  color: var(--qy-link-strong);
  border: 2rpx solid rgba(176, 214, 198, 0.75);
}

.hint-footnote-muted {
  display: block;
  margin-top: 24rpx;
  font-size: 26rpx;
  color: var(--qy-today-red);
}

.hint-footnote {
  display: block;
  margin-top: 32rpx;
  font-size: 26rpx;
  line-height: 40rpx;
  color: var(--qy-text-mute);
}

.scroll-footer-spacer {
  height: 24rpx;
}

.bottom-actions {
  flex-shrink: 0;
  padding: 16rpx 40rpx 0;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  box-sizing: border-box;
}

.safe-bottom {
  padding-bottom: calc(48rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom, 0px));
}

.btn-login {
  height: 104rpx;
  line-height: 104rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 44rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  background: linear-gradient(90deg, rgba(255, 239, 201, 0.99), rgba(214, 241, 228, 0.99));
  border: 2rpx solid rgba(176, 214, 198, 0.95);
  box-shadow: var(--qy-card-shadow);
}

.btn-home-lemon {
  height: 104rpx;
  line-height: 104rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 44rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  background: var(--qy-lemon);
  border: 2rpx solid var(--qy-card-stroke);
}

.tap:active {
  opacity: 0.9;
}
</style>
