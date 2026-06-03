<template>
  <view class="page z-rec">
    <image class="bg" :src="IMG_QUESTION_BG" mode="aspectFill" />
    <view class="mask"></view>

    <view class="stack">
      <ZhiwoNavBar title="测试记录" title-color="rgba(0,0,0,0.72)" />
      <view class="subtitle">{{ subtitleText }}</view>

      <scroll-view scroll-y enhanced class="list-scroll" :show-scrollbar="false">
        <view v-if="!rows.length" class="empty-hint">暂无该类型的测试记录</view>
        <view v-for="item in rows" :key="item.id" class="rec-card">
          <view class="rec-main">
            <view class="rec-topline">
              <text class="rec-type" :class="{ 'rec-type--compact': item.quizId === 'darkness_trend' }">{{ item.typeCode }}</text>
              <text class="rec-alias">{{ item.alias }}</text>
            </view>
            <view v-if="item.keywords.length" class="rec-tags">
              <view v-for="kw in item.keywords" :key="kw" class="tag">{{ kw }}</view>
            </view>
            <view class="rec-mutual-row">
              <text class="rec-mutual-total">互测 {{ item.mutualTotal }}条</text>
              <text v-if="item.showToday" class="rec-mutual-today">今日 {{ item.todayCount }}条</text>
            </view>
            <text class="rec-time">{{ item.timeText }}</text>
          </view>
          <view class="rec-actions">
            <view class="btn-mutual tap" @tap="openMutual(item.id)">看互测</view>
            <view class="btn-info tap" @tap="openInfo(item)">看说明</view>
          </view>
        </view>
        <view class="list-footer-spacer"></view>
      </scroll-view>

      <view class="bottom-actions safe-bottom">
        <view class="action-lemon tap" @tap="mutualAll">{{ mutualAllBtnLabel }}</view>
        <view class="action-lemon tap" @tap="mutualGiven">我给好友的互测</view>
        <view class="action-lemon tap" @tap="goHome">回到首页</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { IMG_QUESTION_BG } from "@/config/static-images";
import { onLoad, onPullDownRefresh, onShow } from "@dcloudio/uni-app";
import ZhiwoNavBar from "@/components/ZhiwoNavBar.vue";
import { getIndexHubCarouselLabel } from "@/data/index-hub-carousel";
import { minigameApp, type SessionQuizId } from "@/state/minigame-app";
import type { NormalizedSelfRecord } from "@/utils/minigame/normalize-records";
import { normalizedToRecordUiRows, totalMutualFriendsCount, type UiRecordRow } from "@/utils/minigame/record-rows";
import { coerceRecordQuizId } from "@/utils/minigame/quiz-id";
import { loadRemoteRecords } from "@/utils/minigame/session";
import { hasUsableWechatProfile } from "@/utils/minigame/profile-guard";
import {
  MIN_MUTUAL_EVALUATIONS_FOR_VIEW,
  MUTUAL_TOO_FEW_MSG,
} from "@/utils/minigame/mutual-view-gate";
import { reLaunchIndexHome } from "@/utils/minigame/index-home";

const MUTUAL_GATE_MSG = MUTUAL_TOO_FEW_MSG;

/** 与首页轮播选中项一致，仅展示该套题记录 */
const recordQuizId = ref<SessionQuizId>("mbti");

onLoad((q) => {
  const raw = q?.quizId ? decodeURIComponent(String(q.quizId)).trim() : "";
  recordQuizId.value = raw ? coerceRecordQuizId(raw) : minigameApp.sessionQuizId;
});

const subtitleText = computed(
  () => `查看「${getIndexHubCarouselLabel(recordQuizId.value)}」的自测与朋友互测结果`,
);

const rows = computed(() =>
  normalizedToRecordUiRows(
    (Array.isArray(minigameApp.records) ? minigameApp.records : []) as NormalizedSelfRecord[],
  )
    .filter((r) => String(r.id || "").trim().length > 0)
    .filter((r) => r.quizId === recordQuizId.value),
);

/** 互测汇总仍基于当前筛选范围内的记录 */
const mutualAllBtnLabel = computed(() => {
  const raw = rows.value.map((r) => {
    const rec = (Array.isArray(minigameApp.records) ? minigameApp.records : []).find(
      (x) => String((x as { id?: string }).id || "") === r.id,
    ) as NormalizedSelfRecord | undefined;
    return rec || { mutualCount: r.mutualTotal };
  });
  const total = totalMutualFriendsCount(raw);
  return `${total}位朋友们眼中的你`;
});

onPullDownRefresh(() => {
  if (!minigameApp.userId || minigameApp.authStatus !== "success") {
    uni.stopPullDownRefresh();
    return;
  }
  void loadRemoteRecords(minigameApp.userId, { keepOnError: true }).finally(() => uni.stopPullDownRefresh());
});

onShow(() => {
  if (minigameApp.authStatus !== "success") {
    uni.redirectTo({
      url: `/pages/records-auth-hint/index?step=login&quizId=${encodeURIComponent(recordQuizId.value)}`,
    });
    return;
  }
  if (!hasUsableWechatProfile(minigameApp.profile)) {
    uni.redirectTo({
      url: `/pages/records-auth-hint/index?step=profile&quizId=${encodeURIComponent(recordQuizId.value)}`,
    });
    return;
  }
  void loadRemoteRecords(minigameApp.userId, { keepOnError: true });
});

function openMutual(id: string) {
  /** zhiwo pages/records：先 mutual-results 拉互测，再有数据时 redirectTo 详情 */
  uni.navigateTo({
    url: `/pages/mutual-results/index?recordId=${encodeURIComponent(String(id).trim())}`,
  });
}

function openInfo(row: UiRecordRow) {
  if (!row.typeCode || row.typeCode === "--") {
    uni.showToast({ title: "暂无类型", icon: "none" });
    return;
  }
  uni.navigateTo({
    url: `/pages/info/index?quizId=${encodeURIComponent(row.quizId)}&type=${encodeURIComponent(row.typeCode)}`,
  });
}

function mutualAll() {
  const raw = rows.value
    .map((r) =>
      (Array.isArray(minigameApp.records) ? minigameApp.records : []).find(
        (x) => String((x as { id?: string }).id || "") === r.id,
      ),
    )
    .filter(Boolean);
  if (!raw.length) {
    uni.showToast({ title: "暂无测试记录", icon: "none" });
    return;
  }
  const total = totalMutualFriendsCount(raw);
  if (total < MIN_MUTUAL_EVALUATIONS_FOR_VIEW) {
    uni.showModal({ title: "提示", content: MUTUAL_GATE_MSG, showCancel: false });
    return;
  }
  uni.navigateTo({
    url: `/pages/mutual-results/index?scope=all&quizId=${encodeURIComponent(recordQuizId.value)}`,
  });
}

function mutualGiven() {
  uni.navigateTo({
    url: `/pages/mutual-given-list/index?quizId=${encodeURIComponent(recordQuizId.value)}`,
  });
}

function goHome() {
  reLaunchIndexHome(recordQuizId.value);
}
</script>

<style lang="scss" scoped>
.z-rec.page {
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

.empty-hint {
  padding: 48rpx 0 24rpx;
  text-align: center;
  font-size: 30rpx;
  color: var(--qy-text-mute);
}

.list-scroll {
  flex: 1;
  min-height: 0;
  height: 0;
  padding: 0 40rpx;
  box-sizing: border-box;
}

.rec-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 300rpx;
  margin-bottom: 28rpx;
  padding: 28rpx 32rpx 28rpx 36rpx;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.74);
  border-radius: 48rpx;
  border: 2rpx solid var(--qy-card-stroke);
  box-shadow: var(--qy-card-shadow);
}

.rec-main {
  flex: 1;
  min-width: 0;
}

.rec-topline {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8rpx 20rpx;
}

.rec-type {
  font-size: 68rpx;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.82);
  line-height: 1.1;
}

.rec-type--compact {
  font-size: 56rpx;
  line-height: 1.15;
}

.rec-alias {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  line-height: 1.2;
}

.rec-tags {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 12rpx;
}

.tag {
  padding: 0 20rpx;
  height: 56rpx;
  line-height: 56rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
  background: var(--qy-lemon);
  color: var(--qy-link-strong);
  box-sizing: border-box;
}

.rec-mutual-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: baseline;
  margin-top: 20rpx;
  gap: 0 16rpx;
}

.rec-mutual-total {
  font-size: 28rpx;
  font-weight: 700;
  color: rgba(120, 106, 97, 0.72);
}

.rec-mutual-today {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--qy-today-red);
}

.rec-time {
  display: block;
  margin-top: 8rpx;
  font-size: 32rpx;
  color: var(--qy-text-mute);
}

.rec-actions {
  flex-shrink: 0;
  width: 192rpx;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16rpx;
}

.btn-mutual {
  height: 84rpx;
  line-height: 84rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  background: linear-gradient(90deg, rgba(213, 241, 228, 0.98), rgba(255, 241, 207, 0.98));
  border: 2rpx solid rgba(176, 214, 198, 0.95);
  box-sizing: border-box;
}

.btn-info {
  height: 84rpx;
  line-height: 84rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  background: rgba(255, 255, 255, 0.9);
  border: 2rpx solid rgba(224, 214, 182, 0.95);
  box-sizing: border-box;
}

.list-footer-spacer {
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
  box-sizing: border-box;
}

.tap:active {
  opacity: 0.88;
}
</style>
