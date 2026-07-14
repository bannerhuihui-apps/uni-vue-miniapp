<template>
  <view class="page z-mrd">
    <image class="bg" :src="IMG_QUESTION_BG" mode="aspectFill" />
    <view class="mask"></view>

    <view v-if="loading" class="stack stack--loading">
      <ZhiwoNavBar :title="navTitle" layered title-color="rgba(0,0,0,0.72)" />
      <view class="loading-tip">加载中…</view>
    </view>

    <view v-else class="stack stack--main">
      <ZhiwoNavBar :title="navTitle" layered title-color="rgba(0,0,0,0.72)" />

      <scroll-view v-if="rows.length" scroll-y enhanced class="list-scroll" :show-scrollbar="false">
        <view class="qy-scroll-fill" :style="{ minHeight: scrollInnerMinPx + 'px' }">
          <view class="qy-scroll-fill__main">
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
                  <text class="mid-label">{{ friendResultLabel }}：</text>
                  <text class="mid-code">{{ item.friendType }}</text>
                </view>
                <text v-if="item.friendAlias && item.friendAlias !== '—'" class="mid-alias">{{ item.friendAlias }}</text>
                <view class="mid-row">
                  <text class="mid-label">{{ selfResultLabel }}：</text>
                  <text class="mid-code">{{ item.viewerSelfType }}</text>
                </view>
                <text v-if="item.viewerSelfAlias && item.viewerSelfAlias !== '—'" class="mid-alias">{{ item.viewerSelfAlias }}</text>
                <text v-if="item.timeText" class="mid-time">{{ item.timeText }}</text>
              </view>
              <view class="card-tail">
                <view class="tail-chip-wrap">
                  <view class="chip" :class="item.chipSame ? 'chip--same' : 'chip--diff'">{{ item.chipText }}</view>
                </view>
                <view class="btn-analyze tap" @tap="openCompare(item)">看分析</view>
              </view>
            </view>
            <view class="list-pad"></view>
          </view>
          <view class="qy-scroll-fill__grow"></view>
        </view>
      </scroll-view>

      <view v-else class="empty-box">
        <text class="empty-txt">暂无互测数据</text>
      </view>

      <view class="bottom safe-bottom">
        <view class="btn-back tap" @tap="onBack">{{ backLabel }}</view>
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
import {
  findSelfRecordById,
  mergeAllMutualFromApi,
  normalizeMutualItem,
  resolveCompareSelfRecord,
  selfTypeLettersFromFindRecord,
  type MutualFriendRowVm,
  pickSelfTestIdExported,
} from "@/utils/minigame/mutual-detail-list";
import type { NormalizedSelfRecord } from "@/utils/minigame/normalize-records";
import {
  buildRecordResultPresentation,
  resolveRawRecordQuizId,
} from "@/utils/minigame/record-result-display";
import { MIN_MUTUAL_EVALUATIONS_FOR_VIEW, MUTUAL_TOO_FEW_MSG } from "@/utils/minigame/mutual-view-gate";
import { filterMutualListByQuizId } from "@/utils/minigame/mutual-scored-aggregate";
import { coerceRecordQuizId, resolveRecordQuizId } from "@/utils/minigame/quiz-id";
import { syncRecordMutualCounts } from "@/utils/minigame/record-sync";
import { scrollInnerMinHeightPx } from "@/utils/minigame/scroll-layout";
import {
  normalizeRecordIdKey,
  queryRecordId,
  readMutualResultsCached,
} from "@/utils/minigame/route-query";

const MUTUAL_GATE_MSG = MUTUAL_TOO_FEW_MSG;

function showMutualTooFewThenBack() {
  uni.showModal({
    title: "提示",
    content: MUTUAL_GATE_MSG,
    showCancel: false,
    complete: () => uni.navigateBack(),
  });
}

const loading = ref(true);
const scopeAll = ref(false);
const recordIdRef = ref("");
const pageQuizId = ref<SessionQuizId>("mbti");
const rows = ref<MutualFriendRowVm[]>([]);
const scrollInnerMinPx = ref(480);
const avatarFailed = reactive<Record<string, boolean>>({});

const navTitle = computed(
  () => `朋友们眼中的你 · ${getIndexHubCarouselLabel(pageQuizId.value)}`,
);
const friendResultLabel = computed(() =>
  pageQuizId.value === "mbti" ? "朋友测试结果" : "朋友眼中的档位",
);
const selfResultLabel = computed(() =>
  pageQuizId.value === "mbti" ? "本人测试结果" : "你的自测档位",
);

const backLabel = computed(() => (scopeAll.value ? "返回汇总" : "返回测试记录"));

function refreshScrollFill() {
  const px = scrollInnerMinHeightPx({
    bottomRpx: 16 + 116 + 24,
    aboveScrollRpx: 0,
  });
  if (scrollInnerMinPx.value !== px) scrollInnerMinPx.value = px;
}

onReady(refreshScrollFill);

function onAvatarError(id: string) {
  avatarFailed[id] = true;
}

/** 与 zhiwo mutual-results-detail.applyList 一致；map 异常时仍结束 loading */
function applyList(arr: unknown[], pageSelfRec: NormalizedSelfRecord | null) {
  const list = Array.isArray(arr) ? arr : [];
  if (!list.length) {
    loading.value = false;
    rows.value = [];
    refreshScrollFill();
    return;
  }
  if (scopeAll.value && list.length < MIN_MUTUAL_EVALUATIONS_FOR_VIEW) {
    minigameApp.mutualAllList = null;
    loading.value = false;
    rows.value = [];
    refreshScrollFill();
    showMutualTooFewThenBack();
    return;
  }
  const pageFb = scopeAll.value ? null : pageSelfRec ? buildRecordResultPresentation(pageSelfRec) : null;
  try {
    rows.value = list.map((item, i) => normalizeMutualItem(item, i, pageFb));
    if (!scopeAll.value && rows.value.length) {
      pageQuizId.value = rows.value[0]!.quizId;
    }
  } catch {
    uni.showToast({ title: "数据解析失败", icon: "none" });
    rows.value = [];
  }
  loading.value = false;
  refreshScrollFill();
}

function loadListAll() {
  const quizId = pageQuizId.value;
  const cached = minigameApp.mutualAllList;
  if (Array.isArray(cached) && cached.length) {
    applyList(filterMutualListByQuizId(cached, quizId), null);
    return;
  }
  uni.showLoading({ title: "加载中", mask: true });
  mergeAllMutualFromApi(quizId)
    .then((list) => {
      const filtered = filterMutualListByQuizId(list, quizId);
      minigameApp.mutualAllList = filtered as unknown[];
      minigameApp.mutualAllQuizId = quizId;
      applyList(filtered, null);
    })
    .catch(() => {
      uni.showToast({ title: "加载失败", icon: "none" });
      loading.value = false;
      rows.value = [];
      refreshScrollFill();
    })
    .finally(() => {
      uni.hideLoading();
    });
}

function loadListSingle(recordId: string, selfRec: NormalizedSelfRecord | null) {
  const rid = normalizeRecordIdKey(recordId);
  if (!rid) {
    loading.value = false;
    rows.value = [];
    refreshScrollFill();
    return;
  }
  if (selfRec) {
    pageQuizId.value = selfRec.quizId || resolveRawRecordQuizId(selfRec);
  }
  const cache = readMutualResultsCached(minigameApp.mutualResultsCache, rid);
  if (cache) {
    applyList(cache, selfRec);
    return;
  }
  uni.showLoading({ title: "加载中", mask: true });
  mg.mgGetMutualResults(rid)
    .then((list) => {
      const arr = Array.isArray(list) ? list : [];
      const appRaw = minigameApp.records as NormalizedSelfRecord[];
      syncRecordMutualCounts(appRaw, rid, arr as { createdAt?: unknown }[]);
      minigameApp.records = [...appRaw];
      minigameApp.mutualResultsCache[rid] = arr as unknown[];
      applyList(arr, selfRec);
    })
    .catch(() => {
      uni.showToast({ title: "互测结果加载失败", icon: "none" });
      syncRecordMutualCounts(minigameApp.records as NormalizedSelfRecord[], rid, []);
      minigameApp.mutualResultsCache[rid] = [];
      loading.value = false;
      rows.value = [];
      refreshScrollFill();
    })
    .finally(() => {
      uni.hideLoading();
    });
}

onLoad((q) => {
  loading.value = true;
  Object.keys(avatarFailed).forEach((k) => {
    delete avatarFailed[k];
  });
  scopeAll.value = (q?.scope as string) === "all";
  recordIdRef.value = queryRecordId(q);

  if (scopeAll.value) {
    minigameApp.showMutualSelfResult = false;
    const rawQuiz = q?.quizId ? decodeURIComponent(String(q.quizId)).trim() : "";
    pageQuizId.value = rawQuiz
      ? coerceRecordQuizId(rawQuiz)
      : minigameApp.mutualAllQuizId || minigameApp.sessionQuizId;
    const raw = minigameApp.records as NormalizedSelfRecord[];
    const firstSelf = raw.find(
      (r) => resolveRecordQuizId(r) === pageQuizId.value && r.result && (r.result as { type?: string }).type,
    );
    if (firstSelf) minigameApp.currentSelfRecord = firstSelf;
    loadListAll();
    return;
  }

  minigameApp.showMutualSelfResult = true;
  if (!recordIdRef.value) {
    loading.value = false;
    uni.showToast({ title: "缺少记录参数", icon: "none" });
    setTimeout(() => uni.navigateBack(), 400);
    return;
  }

  const rec = findSelfRecordById(recordIdRef.value);
  if (rec) pageQuizId.value = rec.quizId || resolveRawRecordQuizId(rec);
  const selfDisplay = selfTypeLettersFromFindRecord(rec);
  minigameApp.currentSelfRecord =
    rec || minigameApp.currentSelfRecord || { id: recordIdRef.value, result: { type: selfDisplay } };

  loadListSingle(recordIdRef.value, rec);
});

function openCompare(item: MutualFriendRowVm) {
  const row = item;
  const pageFb = recordIdRef.value
    ? buildRecordResultPresentation(findSelfRecordById(recordIdRef.value))
    : null;
  const fromRow = resolveCompareSelfRecord(row.raw, pageFb);
  const resolved =
    fromRow ||
    findSelfRecordById(recordIdRef.value) ||
    (minigameApp.currentSelfRecord as NormalizedSelfRecord | null) ||
    null;
  const selfRecord =
    resolved ||
    ((): NormalizedSelfRecord | { id: string; result: { type: string }; answers: unknown[]; quizId?: SessionQuizId } | null => {
      const sid = pickSelfTestIdExported(row.raw);
      return sid
        ? {
            id: sid,
            result: { type: row.viewerSelfType === "--" ? "--" : row.viewerSelfType },
            answers: [],
            quizId: row.quizId,
          }
        : null;
    })();

  const quizId = row.quizId || (selfRecord ? resolveRawRecordQuizId(selfRecord) : pageQuizId.value);

  minigameApp.compareContext = {
    quizId,
    selfRecord:
      selfRecord || {
        id: pickSelfTestIdExported(row.raw) || recordIdRef.value || "",
        result: { type: row.viewerSelfType === "--" ? "--" : row.viewerSelfType },
        answers: [],
        quizId,
      },
    mutualRecord: row.raw,
  };
  uni.navigateTo({ url: "/pages/compare/index" });
}

function onBack() {
  uni.navigateBack();
}
</script>

<style lang="scss" scoped src="./detail-zhiwo.scss"></style>
