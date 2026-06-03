<template>
  <view class="page z-given">
    <image class="bg" :src="IMG_QUESTION_BG" mode="aspectFill" />
    <view class="mask"></view>

    <view class="stack">
      <ZhiwoNavBar :title="navTitle" title-color="rgba(0,0,0,0.72)" />

      <view class="subtitle"><text>{{ subtitleText }}</text></view>

      <scroll-view scroll-y enhanced class="list-scroll" :show-scrollbar="false">
        <view class="qy-scroll-fill" :style="{ minHeight: scrollInnerMinPx + 'px' }">
          <view class="qy-scroll-fill__main">
            <view v-if="!rows.length" class="empty-hint">
              <text>{{ emptyHintText }}</text>
            </view>

            <view v-for="item in rows" :key="item.id" class="card">
              <image
                v-if="item.friendAvatarUrl && !avatarFailed[item.id]"
                class="avatar"
                :src="item.friendAvatarUrl"
                mode="aspectFill"
                @error="onAvatarError(item.id)"
              />
              <view v-else class="avatar avatar--ph"></view>
              <view class="card-mid">
                <text class="mid-name">{{ item.friendNickName }}</text>
                <view class="mid-row">
                  <text class="mid-label">朋友测试结果：</text>
                  <text class="mid-code">{{ maskMutualGivenPeerResultDisplay(item.peerSelfType) }}</text>
                </view>
                <view class="mid-row">
                  <text class="mid-label">本人测试结果：</text>
                  <text class="mid-code">{{ item.compareMutualType }}</text>
                </view>
                <text v-if="item.timeText" class="mid-time">{{ item.timeText }}</text>
              </view>
              <view class="card-tail">
                <view class="chip" :class="item.chipSame ? 'chip--same' : 'chip--diff'">{{ item.chipText }}</view>
              </view>
            </view>
            <view class="list-footer-spacer"></view>
          </view>
          <view class="qy-scroll-fill__grow"></view>
        </view>
      </scroll-view>

      <view class="bottom-actions safe-bottom">
        <view class="action-lemon tap" @tap="backRecords">回到测试记录</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad, onReady, onShow } from "@dcloudio/uni-app";
import { computed, reactive, ref } from "vue";
import * as mg from "@/api/minigame";
import { IMG_QUESTION_BG } from "@/config/static-images";
import ZhiwoNavBar from "@/components/ZhiwoNavBar.vue";
import { getIndexHubCarouselLabel } from "@/data/index-hub-carousel";
import { minigameApp, type SessionQuizId } from "@/state/minigame-app";
import {
  filterMutualGivenRowsByQuizId,
  mapMutualGivenApiRows,
  maskMutualGivenPeerResultDisplay,
  type MutualGivenRowVm,
} from "@/utils/minigame/mutual-given-rows";
import { hasUsableWechatProfile } from "@/utils/minigame/profile-guard";
import { coerceRecordQuizId } from "@/utils/minigame/quiz-id";
import { scrollInnerMinHeightPx } from "@/utils/minigame/scroll-layout";

/** 与测试记录页当前套题一致，仅展示该类型的互测 */
const listQuizId = ref<SessionQuizId>("mbti");

onLoad((q) => {
  const raw = q?.quizId ? decodeURIComponent(String(q.quizId)).trim() : "";
  listQuizId.value = raw ? coerceRecordQuizId(raw) : minigameApp.sessionQuizId;
});

const navTitle = computed(
  () => `我给好友的互测 · ${getIndexHubCarouselLabel(listQuizId.value)}`,
);
const subtitleText = computed(
  () =>
    `查看你为好友完成的「${getIndexHubCarouselLabel(listQuizId.value)}」互测，及与对方自测的认知差异。`,
);
const emptyHintText = computed(
  () =>
    `暂无「${getIndexHubCarouselLabel(listQuizId.value)}」互测记录。完成好友分享的互测邀请后，会出现在这里。`,
);

const rows = ref<MutualGivenRowVm[]>([]);
const scrollInnerMinPx = ref(480);
const avatarFailed = reactive<Record<string, boolean>>({});

function refreshScrollFill() {
  const px = scrollInnerMinHeightPx({
    bottomRpx: 16 + 104 + 24,
    aboveScrollRpx: 8 + 20 + 72,
  });
  if (scrollInnerMinPx.value !== px) scrollInnerMinPx.value = px;
}

onReady(refreshScrollFill);

onShow(() => {
  refreshScrollFill();
  const quizQ = encodeURIComponent(listQuizId.value);
  if (minigameApp.authStatus !== "success") {
    uni.redirectTo({ url: `/pages/records-auth-hint/index?step=login&quizId=${quizQ}` });
    return;
  }
  if (!hasUsableWechatProfile(minigameApp.profile)) {
    uni.redirectTo({ url: `/pages/records-auth-hint/index?step=profile&quizId=${quizQ}` });
    return;
  }
  const userId = minigameApp.userId;
  if (!userId) {
    rows.value = [];
    return;
  }
  mg.mgListMutualGiven(userId)
    .then((data) => {
      const all = mapMutualGivenApiRows(data);
      rows.value = filterMutualGivenRowsByQuizId(all, listQuizId.value);
    })
    .catch(() => {
      uni.showToast({ title: "加载失败", icon: "none" });
      rows.value = [];
    });
});

function onAvatarError(id: string) {
  avatarFailed[id] = true;
}

function backRecords() {
  const url = `/pages/records/index?quizId=${encodeURIComponent(listQuizId.value)}`;
  uni.navigateBack({ fail: () => uni.redirectTo({ url }) });
}
</script>

<style lang="scss" scoped>
.z-given.page {
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
  padding: 8rpx 40rpx 20rpx;
  font-size: 28rpx;
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

.qy-scroll-fill {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.qy-scroll-fill__grow {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
}

.qy-scroll-fill__main {
  flex-shrink: 0;
  width: 100%;
}

.empty-hint {
  padding: 48rpx 0;
  text-align: center;
  font-size: 30rpx;
  color: var(--qy-text-mute);
}

.card {
  display: flex;
  flex-direction: row;
  margin-bottom: 24rpx;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.74);
  border-radius: 48rpx;
  border: 2rpx solid var(--qy-card-stroke);
  box-shadow: var(--qy-card-shadow);
}

.avatar {
  width: 92rpx;
  height: 92rpx;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2rpx solid rgba(255, 255, 255, 0.9);
  align-self: center;
}

.avatar--ph {
  background: rgba(213, 241, 228, 0.9);
}

.card-mid {
  flex: 1;
  min-width: 0;
  margin-left: 20rpx;
}

.mid-name {
  font-size: 44rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
}

.mid-row {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10rpx;
}

.mid-label {
  font-size: 28rpx;
  color: var(--qy-text-mute);
}

.mid-code {
  margin-left: 4rpx;
  font-size: 38rpx;
  font-weight: 700;
  color: rgba(30, 30, 30, 0.9);
}

.mid-time {
  margin-top: 10rpx;
  font-size: 26rpx;
  color: var(--qy-text-mute);
}

.card-tail {
  flex-shrink: 0;
  margin-left: 12rpx;
  width: 176rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: center;
}

.chip {
  height: 80rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip--same {
  color: var(--qy-chip-same);
  background: rgba(201, 239, 216, 0.98);
  border: 2rpx solid rgba(151, 210, 177, 0.95);
}

.chip--diff {
  color: var(--qy-chip-diff);
  background: rgba(255, 228, 216, 0.98);
  border: 2rpx solid rgba(240, 176, 150, 0.95);
}

.list-footer-spacer {
  height: 24rpx;
}

.bottom-actions {
  flex-shrink: 0;
  padding: 16rpx 40rpx 24rpx;
}

.safe-bottom {
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom, 0px));
}

.action-lemon {
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
  opacity: 0.88;
}
</style>
