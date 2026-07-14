<template>
  <view class="page z-mrs">
    <image class="bg" :src="IMG_QUESTION_BG" mode="aspectFill" />
    <view class="mask"></view>

    <view v-if="loading" class="stack stack--loading">
      <ZhiwoNavBar :title="navTitle" layered title-color="rgba(0,0,0,0.72)" />
      <view class="loading-tip">加载中…</view>
    </view>

    <view v-else-if="showContent" class="stack stack--main">
      <ZhiwoNavBar :title="navTitle" layered title-color="rgba(0,0,0,0.72)" />
      <scroll-view scroll-y enhanced class="scroll" :show-scrollbar="false">
        <view class="qy-scroll-fill" :style="{ minHeight: scrollInnerMinPx + 'px' }">
          <view class="qy-scroll-fill__main">
            <view v-if="showSelfSub" class="sub-line">你的自测结果：{{ selfTypeDisplay }}</view>

            <view v-if="modeAll && summary.hasSummaryData" class="summary-card">
              <!-- MBTI：四字母合成类型 -->
              <view v-if="!summary.isScoredQuiz && summary.composite" class="sum-head">
                <view class="sum-type-row sum-type-row--type">
                  <view class="sum-type sum-type--split">
                    <text
                      v-for="(ch, cpi) in summary.compositeParts"
                      :key="cpi"
                      class="sum-type-ch"
                      :class="{ 'sum-type-ch--disputed': ch.disputed }"
                    >
                      {{ ch.text }}
                    </text>
                  </view>
                  <text v-if="summary.aliasTop" class="sum-alias">{{ summary.aliasTop }}</text>
                </view>
                <view v-if="summary.showTfControversyHint" class="sum-tf-hint">
                  看来朋友眼中的您，颇具争议性，建议您请更多的朋友，来进行更多的性格画像。
                </view>
              </view>
              <!-- 趣味测评：最常见档位 -->
              <view v-else-if="summary.isScoredQuiz && summary.scoredHeadline" class="sum-head">
                <view class="sum-type-row sum-type-row--type">
                  <text class="sum-type sum-type--scored">{{ summary.scoredHeadline }}</text>
                  <text v-if="summary.aliasTop" class="sum-alias">{{ summary.aliasTop }}</text>
                </view>
              </view>
              <view v-else class="sum-weak">暂无足够数据生成综合结果</view>

              <text v-if="summary.showTopTypes" class="sum-freq">{{ summary.topTypesText }}</text>

              <view class="sum-block-title">{{ summary.quadBlockTitle }}</view>
              <text class="sum-block-sub">共 {{ summary.totalFriends }} 位朋友完成互测</text>

              <!-- 朋友结果汇总：MBTI 四维度 / 趣味测评 A·B、C·D 对比胶囊（始终展示） -->
              <view class="pill-grid">
                <view v-for="(pair, pr) in summary.pillPairs" :key="pr" class="pill-row">
                  <view v-for="(row, ri) in pair" :key="ri" class="pill-cell" :class="row.pillTone">
                    <text class="pill-text">
                      {{ row.leftLabel }} {{ row.leftCount }} / {{ row.rightLabel }}
                      {{ row.rightCount }}
                    </text>
                  </view>
                </view>
              </view>

              <!-- 维度倾向（n < 5 时遮罩，与 zhiwo 一致） -->
              <view v-if="summary.dimRows.length" class="dim-section">
                <view class="dim-cap">维度倾向</view>
                <view v-for="(row, di) in summary.dimRows" :key="di" class="dim-row">
                  <view class="dim-bar" :style="{ background: row.grad }">
                    <view class="dim-split-wrap" :style="{ left: row.leftPercent + '%' }">
                      <view class="dim-split-mark">
                        <view
                          v-if="row.splitHeavy === 'left'"
                          class="dim-split-tee dim-split-tee--left"
                        >
                          <view class="dim-split-arrowhead dim-split-arrowhead--left"></view>
                          <view class="dim-split-h"></view>
                        </view>
                        <view class="dim-split-v"></view>
                        <view
                          v-if="row.splitHeavy === 'right'"
                          class="dim-split-tee dim-split-tee--right"
                        >
                          <view class="dim-split-h"></view>
                          <view class="dim-split-arrowhead dim-split-arrowhead--right"></view>
                        </view>
                      </view>
                    </view>
                  </view>
                  <view class="dim-labels">
                    <text class="dim-l">{{ row.leftLabel }} {{ row.leftPercent }}%</text>
                    <text class="dim-r">{{ row.rightPercent }}% {{ row.rightLabel }}</text>
                  </view>
                </view>

                <view v-if="dimSectionMaskVisible" class="dim-section-mask" @touchmove.stop.prevent>
                  <view class="dim-section-mask-hint">
                    <text class="dim-section-mask-title">维度对比待解锁</text>
                    <text class="dim-section-mask-desc">
                      需累计满 {{ dimUnlockNeed }} 条好友互测，开放后即可查看下方四维度倾向。
                    </text>
                    <text class="dim-section-mask-only">
                      当前 {{ summary.totalFriends }}/{{ dimUnlockNeed }} 条
                    </text>
                  </view>
                </view>
              </view>
            </view>

            <view v-if="!summary.hasSummaryData" class="empty-card">
              <text class="empty-title">还没有朋友完成互测</text>
              <text class="empty-desc">先去邀请朋友，完成后就能在这里看到对比分析</text>
            </view>

            <view class="scroll-pad"></view>
          </view>
          <view class="qy-scroll-fill__grow"></view>
        </view>
      </scroll-view>

      <view class="bottom safe-bottom">
        <view class="btn-lemon tap" @tap="onPrimary">{{ primaryBtnText }}</view>
        <view class="btn-lemon btn-gap tap" @tap="onHome">返回首页</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad, onReady } from "@dcloudio/uni-app";
import { computed, reactive, ref } from "vue";
import * as mg from "@/api/minigame";
import { IMG_QUESTION_BG } from "@/config/static-images";
import ZhiwoNavBar from "@/components/ZhiwoNavBar.vue";
import { getIndexHubCarouselLabel } from "@/data/index-hub-carousel";
import { minigameApp, type SessionQuizId } from "@/state/minigame-app";
import { buildSummaryFieldsForQuiz, type MutualSummaryVm } from "@/utils/minigame/mutual-aggregate";
import { filterMutualListByQuizId } from "@/utils/minigame/mutual-scored-aggregate";
import {
  MIN_FRIEND_MUTUAL_FOR_DIM,
  MIN_MUTUAL_EVALUATIONS_FOR_VIEW,
  MUTUAL_TOO_FEW_MSG,
} from "@/utils/minigame/mutual-view-gate";
import type { NormalizedSelfRecord } from "@/utils/minigame/normalize-records";
import { syncRecordMutualCounts } from "@/utils/minigame/record-sync";
import { scrollInnerMinHeightPx } from "@/utils/minigame/scroll-layout";
import { normalizeRecordIdKey, queryRecordId } from "@/utils/minigame/route-query";
import { reLaunchIndexHome } from "@/utils/minigame/index-home";
import { coerceRecordQuizId, resolveRecordQuizId } from "@/utils/minigame/quiz-id";

function showMutualTooFewThenBack() {
  uni.showModal({
    title: "提示",
    content: MUTUAL_TOO_FEW_MSG,
    showCancel: false,
    complete: () => uni.navigateBack(),
  });
}

const loading = ref(true);
const showContent = ref(false);
const modeAll = ref(false);
const summaryQuizId = ref<SessionQuizId>("mbti");
const showSelfSub = ref(false);
const selfTypeDisplay = ref("--");
const primaryBtnText = ref("返回记录");
const scrollInnerMinPx = ref(480);
const dimSectionMaskVisible = ref(true);
const dimUnlockNeed = ref(MIN_FRIEND_MUTUAL_FOR_DIM);
const summary = reactive<MutualSummaryVm>(buildSummaryFieldsForQuiz([], "mbti"));

const navTitle = computed(
  () => `朋友们眼中的你 · ${getIndexHubCarouselLabel(summaryQuizId.value)}`,
);

function refreshScrollMin() {
  const px = scrollInnerMinHeightPx({
    bottomRpx: 16 + 104 + 24 + 104 + 24,
    aboveScrollRpx: 0,
  });
  if (scrollInnerMinPx.value !== px) scrollInnerMinPx.value = px;
}

onReady(refreshScrollMin);

function findSelfRecord(recordId: string): NormalizedSelfRecord | null {
  const raw = minigameApp.records as NormalizedSelfRecord[];
  if (!Array.isArray(raw)) return null;
  return raw.find((r) => normalizeRecordIdKey(r?.id) === normalizeRecordIdKey(recordId)) || null;
}

function applySummaryVm(s: MutualSummaryVm) {
  summary.quizId = s.quizId;
  summary.isScoredQuiz = s.isScoredQuiz;
  summary.scoredHeadline = s.scoredHeadline;
  summary.hasSummaryData = s.hasSummaryData;
  summary.composite = s.composite;
  summary.compositeParts = s.compositeParts.slice();
  summary.showTfControversyHint = s.showTfControversyHint;
  summary.aliasTop = s.aliasTop;
  summary.topTypesText = s.topTypesText;
  summary.showTopTypes = s.showTopTypes;
  summary.pillRows = s.pillRows.slice();
  summary.pillPairs = s.pillPairs.map((row) => row.map((cell) => ({ ...cell })));
  summary.quadGrid = s.quadGrid.map((row) => row.map((cell) => ({ ...cell })));
  summary.dimRows = s.dimRows.slice();
  summary.totalFriends = s.totalFriends;
  summary.quadBlockTitle = s.quadBlockTitle;
  summary.quadBlockSub = s.quadBlockSub;
}

/** 与 zhiwo loadAllMutual finish：汇总统计 + 维度遮罩（n < 5） */
function applySummaryFromList(list: unknown[], quizId: SessionQuizId) {
  const s = buildSummaryFieldsForQuiz(list, quizId);
  const n = s.totalFriends;
  dimSectionMaskVisible.value = n < MIN_FRIEND_MUTUAL_FOR_DIM;
  dimUnlockNeed.value = MIN_FRIEND_MUTUAL_FOR_DIM;
  applySummaryVm(s);
  primaryBtnText.value = n ? "查看详情" : "返回记录";
}

function loadAllMutual() {
  const allRaw = minigameApp.records as NormalizedSelfRecord[];
  const raw = Array.isArray(allRaw)
    ? allRaw.filter((rec) => resolveRecordQuizId(rec) === summaryQuizId.value)
    : [];
  if (!raw.length) {
    loading.value = false;
    uni.showToast({ title: "暂无该套题的测试记录", icon: "none" });
    setTimeout(() => uni.navigateBack(), 400);
    return;
  }

  const firstSelf = raw.find((r) => r.result && (r.result as { type?: string }).type);
  minigameApp.currentSelfRecord = firstSelf ?? raw[0];
  minigameApp.showMutualSelfResult = false;

  const finish = (merged: unknown[], perRecordLists: unknown[][]) => {
    const appRaw = minigameApp.records as NormalizedSelfRecord[];
    perRecordLists.forEach((arr, idx) => {
      const rec = raw[idx];
      if (!rec) return;
      syncRecordMutualCounts(appRaw, rec.id, Array.isArray(arr) ? arr : []);
    });
    minigameApp.records = [...appRaw];

    const filtered = filterMutualListByQuizId(merged, summaryQuizId.value);

    if (!Array.isArray(filtered) || filtered.length < MIN_MUTUAL_EVALUATIONS_FOR_VIEW) {
      minigameApp.mutualAllList = null;
      minigameApp.mutualAllQuizId = "";
      loading.value = false;
      showContent.value = false;
      refreshScrollMin();
      showMutualTooFewThenBack();
      return;
    }

    minigameApp.mutualAllList = filtered as unknown[];
    minigameApp.mutualAllQuizId = summaryQuizId.value;
    applySummaryFromList(filtered, summaryQuizId.value);
    loading.value = false;
    showContent.value = true;
    refreshScrollMin();
  };

  uni.showLoading({ title: "加载中", mask: true });
  Promise.all(raw.map((rec) => mg.mgGetMutualResults(rec.id).catch(() => [])))
    .then((results) => {
      uni.hideLoading();
      const merged: unknown[] = [];
      results.forEach((list) => {
        if (Array.isArray(list)) merged.push(...list);
      });
      finish(merged, results);
    })
    .catch(() => {
      uni.hideLoading();
      uni.showToast({ title: "互测结果加载失败", icon: "none" });
      const appRaw = minigameApp.records as NormalizedSelfRecord[];
      raw.forEach((rec) => syncRecordMutualCounts(appRaw, rec.id, []));
      minigameApp.records = [...appRaw];
      setTimeout(() => uni.navigateBack(), 400);
    });
}

/** 单条记录：无互测停留本页；有互测直达详情（与 zhiwo fetchSingleAndRoute 一致） */
function fetchSingleAndRoute(recordId: string) {
  const rid = normalizeRecordIdKey(recordId);
  if (!rid) {
    loading.value = false;
    showContent.value = true;
    uni.showToast({ title: "缺少记录参数", icon: "none" });
    return;
  }

  const rec = findSelfRecord(rid);
  const selfType = (rec?.result as { type?: string } | undefined)?.type || "--";
  selfTypeDisplay.value = selfType;
  showSelfSub.value = true;
  minigameApp.showMutualSelfResult = true;

  uni.showLoading({ title: "加载中", mask: true });
  mg.mgGetMutualResults(rid)
    .then((list) => {
      uni.hideLoading();
      const arr = Array.isArray(list) ? list : [];
      const appRaw = minigameApp.records as NormalizedSelfRecord[];
      syncRecordMutualCounts(appRaw, rid, arr as { createdAt?: unknown }[]);
      minigameApp.records = [...appRaw];
      minigameApp.mutualResultsCache[rid] = arr as unknown[];

      if (arr.length) {
        const quizId = rec ? resolveRecordQuizId(rec) : summaryQuizId.value;
        const detailUrl = `/pages/mutual-results-detail/index?recordId=${encodeURIComponent(rid)}&from=records&quizId=${encodeURIComponent(quizId)}`;
        uni.redirectTo({
          url: detailUrl,
          fail: () => {
            uni.navigateTo({ url: detailUrl });
          },
        });
        return;
      }

      applySummaryVm(buildSummaryFieldsForQuiz([], summaryQuizId.value));
      primaryBtnText.value = "返回记录";
      loading.value = false;
      showContent.value = true;
      refreshScrollMin();
    })
    .catch(() => {
      uni.hideLoading();
      uni.showToast({ title: "互测结果加载失败", icon: "none" });
      syncRecordMutualCounts(minigameApp.records as NormalizedSelfRecord[], rid, []);
      minigameApp.mutualResultsCache[rid] = [];
      applySummaryVm(buildSummaryFieldsForQuiz([], summaryQuizId.value));
      primaryBtnText.value = "返回记录";
      loading.value = false;
      showContent.value = true;
      refreshScrollMin();
    });
}

onLoad((q) => {
  loading.value = true;
  showContent.value = false;
  const rawQuiz = q?.quizId ? decodeURIComponent(String(q.quizId)).trim() : "";
  summaryQuizId.value = rawQuiz ? coerceRecordQuizId(rawQuiz) : minigameApp.sessionQuizId;

  if ((q?.scope as string) === "all") {
    modeAll.value = true;
    loadAllMutual();
    return;
  }

  modeAll.value = false;
  const recordId = queryRecordId(q);
  if (!recordId) {
    loading.value = false;
    uni.showToast({ title: "缺少记录参数", icon: "none" });
    setTimeout(() => uni.navigateBack(), 400);
    return;
  }

  const rec = findSelfRecord(recordId);
  minigameApp.currentSelfRecord = rec || { id: normalizeRecordIdKey(recordId), result: null };
  fetchSingleAndRoute(recordId);
});

function onPrimary() {
  if (modeAll.value && summary.hasSummaryData) {
    uni.navigateTo({
      url: `/pages/mutual-results-detail/index?scope=all&from=summary&quizId=${encodeURIComponent(summaryQuizId.value)}`,
    });
    return;
  }
  uni.navigateBack();
}

function onHome() {
  reLaunchIndexHome(summaryQuizId.value);
}
</script>

<style lang="scss" scoped src="./mutual-results-zhiwo.scss"></style>
