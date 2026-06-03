<template>
  <view class="page ps-page">
    <image class="bg" :src="IMG_QUESTION_BG" mode="aspectFill" aria-hidden="true" />
    <view class="mask"></view>

    <view class="stack">
      <ZhiwoNavBar title="头像与昵称" title-color="rgba(0,0,0,0.78)" />
      <view class="subtitle">选择头像并填写昵称，用于展示与对方互测场景（以下为演示占位）。</view>

      <view class="flex-fill">
        <view class="profile-card">
          <text class="profile-title">头像与昵称</text>
          <text class="profile-intro">与原小程序形态对齐：微信端使用原生能力；H5 / App 选用本地图片与普通输入。</text>

          <!-- #ifdef MP-WEIXIN -->
          <view class="profile-native">
            <button class="profile-avatar-btn reset-btn" open-type="chooseAvatar" @chooseavatar="onWxChooseAvatar">
              <image v-if="avatarUrl" class="profile-avatar-img" :src="avatarUrl" mode="aspectFill" />
              <text v-else class="profile-avatar-placeholder">选择头像</text>
            </button>
            <input
              class="profile-nick-input"
              type="nickname"
              :value="nickname"
              placeholder="点击填写昵称"
              @blur="onNickBlurWx"
              @input="onNickInputWx"
            />
          </view>
          <!-- #endif -->

          <!-- #ifndef MP-WEIXIN -->
            <view class="profile-native">
            <view class="profile-avatar-btn tap avatar-fallback" @tap="pickAvatarH5">
              <image v-if="avatarUrl" class="profile-avatar-img" :src="avatarUrl" mode="aspectFill" />
              <text v-else class="profile-avatar-placeholder">选择头像</text>
            </view>
            <input
              class="profile-nick-input"
              maxlength="24"
              :value="nickname"
              placeholder="填写昵称（演示）"
              @input="onNickInputUni"
            />
          </view>
          <!-- #endif -->

          <text class="profile-foot">演示环境不会上传到服务器；接入正式版时请走 wx.login / 服务端落库校验。</text>
        </view>
      </view>

      <view class="ps-footer safe-ps-footer">
        <view class="ps-submit tap" @tap="onSubmit">完成</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { IMG_QUESTION_BG } from "@/config/static-images";
import ZhiwoNavBar from "@/components/ZhiwoNavBar.vue";
import { minigameApp } from "@/state/minigame-app";
import { ensureLogin } from "@/utils/minigame/session";
import { isPlaceholderNickname } from "@/utils/minigame/profile-guard";
import { persistWechatChosenProfile } from "@/utils/minigame/save-wechat-profile";

/** 成功后默认回到测试记录，可由 query.redirect 自定义（需 encodeURIComponent） */
const redirectTo = ref("/pages/records/index");
const nickname = ref("");
const avatarUrl = ref("");

onLoad((q) => {
  const raw = typeof q?.redirect === "string" ? q.redirect.trim() : "";
  if (raw) {
    try {
      redirectTo.value = decodeURIComponent(raw);
    } catch {
      redirectTo.value = raw;
    }
  }
});

function onWxChooseAvatar(e: { detail?: { avatarUrl?: string } }) {
  const u = e?.detail?.avatarUrl;
  if (u) avatarUrl.value = u;
}

/** 微信昵称能力：blur 时能拿到草稿；这里仍用双向逻辑简化 */
function onNickInputWx(e: { detail?: { value?: string } }) {
  nickname.value = e?.detail?.value ?? "";
}

function onNickBlurWx(e: { detail?: { value?: string } }) {
  nickname.value = (e?.detail?.value ?? nickname.value).trim();
}

// #ifndef MP-WEIXIN
function pickAvatarH5() {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      const p = res.tempFilePaths?.[0];
      if (p) avatarUrl.value = p;
    },
  });
}

function onNickInputUni(e: { detail?: { value?: string } }) {
  nickname.value = e?.detail?.value ?? "";
}
// #endif

async function onSubmit() {
  const n = nickname.value.trim();
  if (!n.length) {
    uni.showToast({ title: "请填写昵称", icon: "none" });
    return;
  }
  if (isPlaceholderNickname(n)) {
    uni.showToast({ title: "请重新填写昵称", icon: "none" });
    return;
  }
  if (!avatarUrl.value) {
    uni.showToast({ title: "请选择头像", icon: "none" });
    return;
  }
  if (!minigameApp.userId) {
    try {
      await ensureLogin(true);
    } catch {
      return;
    }
  }
  if (!minigameApp.userId) {
    uni.showToast({ title: "请先完成微信登录", icon: "none" });
    return;
  }

  uni.showLoading({ title: "保存中…", mask: true });
  try {
    await persistWechatChosenProfile({ nickName: n, avatarDraftUrl: avatarUrl.value });
    uni.hideLoading();
    uni.showToast({ title: "已保存", icon: "success", duration: 1000 });
    setTimeout(() => {
      uni.reLaunch({ url: redirectTo.value });
    }, 400);
  } catch (e) {
    uni.hideLoading();
    uni.showToast({ title: (e as Error)?.message || "保存失败", icon: "none" });
  }
}
</script>

<style lang="scss" scoped>
.ps-page {
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
  inset: 0;
  width: 100%;
  height: 100%;
}

.mask {
  position: absolute;
  inset: 0;
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
  flex-shrink: 0;
  padding: 8rpx 40rpx 20rpx;
  font-size: 30rpx;
  line-height: 1.45;
  color: var(--qy-text-mute);
}

.flex-fill {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 40rpx 24rpx;
  box-sizing: border-box;
}

.profile-card {
  width: 100%;
  max-width: 640rpx;
  padding: 44rpx 40rpx 40rpx;
  box-sizing: border-box;
  background: linear-gradient(180deg, rgba(255, 250, 244, 0.96), rgba(251, 244, 233, 0.95));
  border-radius: 52rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.65);
  box-shadow: var(--qy-card-shadow-modal);
}

.profile-title {
  display: block;
  text-align: center;
  font-size: 40rpx;
  font-weight: 700;
  color: rgba(32, 32, 32, 0.92);
  line-height: 1.35;
  margin-bottom: 24rpx;
}

.profile-intro {
  display: block;
  margin-bottom: 28rpx;
  font-size: 28rpx;
  line-height: 1.55;
  color: var(--qy-text-mute);
}

.profile-native {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28rpx;
  width: 100%;
}

.reset-btn.profile-avatar-btn {
  margin: 0;
}

.profile-avatar-btn {
  --avatar-size: 120rpx;
  box-sizing: border-box;
  padding: 0;
  width: var(--avatar-size);
  height: var(--avatar-size);
  min-width: var(--avatar-size);
  min-height: var(--avatar-size);
  line-height: 1;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.85);
  border: 2rpx solid rgba(176, 214, 198, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar-btn::after {
  border: none;
}

.profile-avatar-img {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 50%;
}

.profile-avatar-placeholder {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  padding: 0 12rpx;
  text-align: center;
  line-height: 1.25;
}

.profile-nick-input {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  padding: 0 28rpx;
  box-sizing: border-box;
  border-radius: 24rpx;
  border: 2rpx solid rgba(176, 214, 198, 0.95);
  background: rgba(255, 255, 255, 0.92);
  font-size: 32rpx;
  color: rgba(32, 32, 32, 0.92);
}

.profile-foot {
  display: block;
  margin-top: 28rpx;
  font-size: 26rpx;
  line-height: 1.5;
  color: var(--qy-text-mute);
}

.ps-footer {
  flex-shrink: 0;
  padding: 12rpx 40rpx 0;
  padding-bottom: calc(48rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

.ps-submit {
  height: 116rpx;
  line-height: 116rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 48rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  background: linear-gradient(90deg, rgba(255, 239, 201, 0.99), rgba(214, 241, 228, 0.99));
  border: 2rpx solid rgba(176, 214, 198, 0.95);
  box-shadow: var(--qy-card-shadow);
  box-sizing: border-box;
}

.tap:active {
  opacity: 0.9;
}
</style>
