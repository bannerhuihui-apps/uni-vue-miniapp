<template>
  <view class="page z-inv">
    <image class="bg" :src="IMG_QUESTION_BG" mode="aspectFill" />
    <view class="mask"></view>

    <view class="stack">
      <ZhiwoNavBar title="邀请朋友来测" title-color="rgba(0,0,0,0.78)" />
      <view class="headlines">
        <text class="headline-main">选择一条测试发给朋友</text>
        <text class="headline-sub">好友完成后，你就能查看 TA 眼中的你</text>
      </view>

      <scroll-view scroll-y enhanced class="list-scroll" :show-scrollbar="false">
        <view v-if="!rows.length" class="empty-hint">暂无自测记录，请先在首页完成自测</view>
        <view v-for="item in rows" :key="item.id" class="inv-card">
          <view class="inv-main">
            <view class="inv-topline">
              <text class="inv-type">{{ item.typeCode }}</text>
              <text class="inv-alias">{{ item.alias }}</text>
            </view>
            <view v-if="item.keywords.length" class="inv-tags">
              <view v-for="kw in item.keywords" :key="kw" class="inv-tag">{{ kw }}</view>
            </view>
            <text class="inv-time">{{ item.timeText }}</text>
          </view>
          <view class="inv-actions">
            <button
              class="btn-capsule btn-share tap invite-share-btn"
              hover-class="btn-capsule--pressed"
              open-type="share"
              :data-record-id="item.id"
              :data-type-code="item.typeCode"
              :data-quiz-id="item.quizId"
            >
              <text class="btn-label">发给朋友</text>
            </button>
            <view class="btn-capsule btn-info tap" @tap="openInfo(item)">
              <text class="btn-label">看说明</text>
            </view>
          </view>
        </view>
        <view class="list-footer-spacer"></view>
      </scroll-view>

      <!-- 与首页 / 承接页同款免责文案，贴合底部按钮区与安全区 -->
      <view class="notice-line">测试结果仅供娱乐，不具有任何指向性及指导性，请玩家适度娱乐。</view>
      <view class="bottom-bar safe-bottom">
        <view class="btn-home tap" @tap="goHome">返回首页</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onShareAppMessage, onShow } from "@dcloudio/uni-app";
import { IMG_QUESTION_BG } from "@/config/static-images";
import ZhiwoNavBar from "@/components/ZhiwoNavBar.vue";
import * as mg from "@/api/minigame";
import { SHARE_CARD_IMAGE_URL } from "@/constants/share-assets";
import { minigameApp, type SessionQuizId } from "@/state/minigame-app";
import type { NormalizedSelfRecord } from "@/utils/minigame/normalize-records";
import { normalizedToInviteUiRows, type UiRecordRow } from "@/utils/minigame/record-rows";
import { coerceRecordQuizId } from "@/utils/minigame/quiz-id";
import {
  buildMutualInviteSharePath,
  buildMutualInviteShareTitle,
} from "@/utils/minigame/invite-share";
import { indexHomeUrl, reLaunchIndexHome } from "@/utils/minigame/index-home";
import { getAppId } from "@/utils/minigame/app-env";
import { getApiSource } from "@/utils/minigame/session";
import { hasUsableWechatProfile } from "@/utils/minigame/profile-guard";

/** 从首页进入时可只展示当前套题的自测记录 */
const inviteQuizFilter = ref<SessionQuizId | "">("");

onLoad((q) => {
  const raw = q?.quizId ? decodeURIComponent(String(q.quizId)).trim() : "";
  inviteQuizFilter.value = raw ? coerceRecordQuizId(raw) : "";
});

const rows = computed(() => {
  let list = normalizedToInviteUiRows(
    (Array.isArray(minigameApp.records) ? minigameApp.records : []) as NormalizedSelfRecord[],
  );
  if (inviteQuizFilter.value) {
    list = list.filter((r) => r.quizId === inviteQuizFilter.value);
  }
  return list;
});

onShow(() => {
  // #ifdef MP-WEIXIN
  uni.showShareMenu?.({ menus: ["shareAppMessage"] });
  // #endif
});

onShareAppMessage((event) => {
  const menuFallback = {
    title: "知我几分 · 邀请互测",
    path: indexHomeUrl(),
    imageUrl: SHARE_CARD_IMAGE_URL,
  };
  const ev = event as { from?: string; target?: { dataset?: Record<string, string> } };
  if (ev.from !== "button") return menuFallback;

  const ds = ev.target?.dataset || {};
  const recordIdRaw = ds.recordId || ds.recordid || "";
  const recordId = String(recordIdRaw).trim();
  const typeCode = String(ds.typeCode || ds.typecode || "--");
  const quizId = coerceRecordQuizId(ds.quizId || ds.quizid || "mbti");

  const userId = minigameApp.userId;
  if (!userId) {
    uni.showToast({ title: "请先完成登录", icon: "none" });
    return menuFallback;
  }
  const profile = minigameApp.profile || {};
  if (!hasUsableWechatProfile(profile)) {
    uni.showToast({
      title: "请先在设置或资料页完善真实昵称与头像",
      icon: "none",
    });
    return menuFallback;
  }
  if (!recordId) {
    uni.showToast({ title: "记录无效", icon: "none" });
    return menuFallback;
  }

  uni.showLoading({ title: "创建邀请…", mask: true });
  const selfTestId = recordId;

  return mg
    .mgCreateInvite({
      ownerUserId: userId,
      ownerNickName: (profile.nickName as string) || "",
      selfTestId,
      targetName: "TA",
      appId: getAppId(),
      source: getApiSource(),
      quizId,
    })
    .then((inviteRaw) => {
      uni.hideLoading();
      const invite = inviteRaw as { inviteId?: string; invite_id?: string };
      const inviteId = String(invite?.inviteId || invite?.invite_id || "").trim();
      if (!invite || !inviteId) {
        uni.showToast({ title: "创建邀请失败", icon: "none" });
        return menuFallback;
      }
      const nick = (profile.nickName as string) || "我";
      return {
        title: buildMutualInviteShareTitle(nick, quizId, typeCode),
        path: buildMutualInviteSharePath({
          inviteId,
          ownerNickName: nick,
          selfTestId,
          quizId,
          ownerResult: typeCode,
        }),
        imageUrl: SHARE_CARD_IMAGE_URL,
      };
    })
    .catch((err: Error | undefined) => {
      uni.hideLoading();
      const msg = (err && err.message) || "";
      const short = msg.length > 36 ? `${msg.slice(0, 34)}…` : msg;
      uni.showToast({ title: short || "创建邀请失败", icon: "none" });
      return menuFallback;
    });
});

function openInfo(row: UiRecordRow) {
  if (!row.typeCode || row.typeCode === "--") {
    uni.showToast({ title: "暂无结果", icon: "none" });
    return;
  }
  uni.navigateTo({
    url: `/pages/info/index?quizId=${encodeURIComponent(row.quizId)}&type=${encodeURIComponent(row.typeCode)}`,
  });
}

function goHome() {
  reLaunchIndexHome(inviteQuizFilter.value || minigameApp.sessionQuizId);
}
</script>

<style lang="scss" scoped>
.z-inv.page {
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
  right: 0;
  bottom: 0;
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

.headlines {
  padding: 8rpx 40rpx 16rpx;
  box-sizing: border-box;
}

.headline-main {
  display: block;
  font-size: 56rpx;
  font-weight: 700;
  line-height: 1.35;
  color: rgba(0, 0, 0, 0.78);
}

.headline-sub {
  display: block;
  margin-top: 12rpx;
  font-size: 36rpx;
  line-height: 1.45;
  color: var(--qy-text-mute);
}

.list-scroll {
  flex: 1;
  min-height: 0;
  height: 0;
  padding: 0 40rpx;
  box-sizing: border-box;
}

.empty-hint {
  padding: 48rpx 0;
  text-align: center;
  font-size: 30rpx;
  color: var(--qy-text-mute);
}

.inv-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 264rpx;
  margin-bottom: 24rpx;
  padding: 24rpx 28rpx 24rpx 36rpx;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.74);
  border-radius: 48rpx;
  border: 2rpx solid var(--qy-card-stroke);
  box-shadow: var(--qy-card-shadow);
}

.inv-main {
  flex: 1;
  min-width: 0;
}

.inv-topline {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8rpx 20rpx;
}

.inv-type {
  font-size: 68rpx;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.82);
  line-height: 1.1;
}

.inv-alias {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  line-height: 1.2;
}

.inv-tags {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 12rpx;
}

.inv-tag {
  padding: 0 20rpx;
  height: 56rpx;
  line-height: 56rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
  background: var(--qy-lemon);
  color: var(--qy-link-strong);
  box-sizing: border-box;
}

.inv-time {
  display: block;
  margin-top: 16rpx;
  font-size: 32rpx;
  color: var(--qy-text-mute);
}

.inv-actions {
  flex-shrink: 0;
  width: 200rpx;
  margin-left: 16rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20rpx;
}

.btn-label {
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
}

.btn-capsule {
  margin: 0;
  padding: 0;
  width: 100%;
  min-width: 0;
  height: 84rpx;
  box-sizing: border-box;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-share {
  background: linear-gradient(90deg, rgba(213, 241, 228, 0.98), rgba(255, 241, 207, 0.98));
  border: 2rpx solid rgba(176, 214, 198, 0.95);
}

.btn-info {
  background: rgba(255, 255, 255, 0.9);
  border: 2rpx solid rgba(224, 214, 182, 0.95);
}

.btn-capsule--pressed {
  opacity: 0.88;
}

.invite-share-btn::after {
  border: none;
}

.list-footer-spacer {
  height: 24rpx;
}

.notice-line {
  flex-shrink: 0;
  padding: 20rpx 76rpx 0;
  text-align: center;
  box-sizing: border-box;
  font-size: 26rpx;
  line-height: 1.45;
  color: rgba(140, 134, 130, 0.95);
}

.bottom-bar {
  flex-shrink: 0;
  padding: 16rpx 64rpx 0;
  box-sizing: border-box;
}

/** 与首页 footer-block：`calc(72rpx + env(safe-area-inset-bottom))` */
.safe-bottom {
  padding-bottom: calc(72rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(72rpx + env(safe-area-inset-bottom, 0px));
}

.btn-home {
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
  opacity: 0.9;
}
</style>
