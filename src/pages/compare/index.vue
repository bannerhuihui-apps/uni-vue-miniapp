<template>
  <view class="page z-cmp">
    <image class="bg" :src="IMG_QUESTION_BG" mode="aspectFill" />
    <view class="mask"></view>

    <view class="stack">
      <ZhiwoNavBar title="知我几分分析" title-color="rgba(0,0,0,0.78)" />

      <scroll-view scroll-y enhanced class="scroll-area" :show-scrollbar="false">
        <view class="cmp-scroll-inner">
            <view class="card card-types">
              <view class="types-row">
                <view class="types-col types-col--tap tap" @tap="openModal('self')">
                  <text class="types-label">{{ c.selfTypesLabel }}</text>
                  <text class="types-code">{{ c.selfType }}</text>
                  <text class="types-alias">{{ c.selfAlias }}</text>
                </view>
                <view class="types-col types-col--right types-col--tap tap" @tap="openModal('mutual')">
                  <text class="types-label">{{ c.mutualTypesLabel }}</text>
                  <text class="types-code">{{ c.mutualType }}</text>
                  <text class="types-alias">{{ c.mutualAlias }}</text>
                </view>
              </view>
            </view>

            <view class="card card-score">
              <text class="score-num">{{ c.score }}%</text>
              <text class="score-cap">认知贴合度</text>
              <text class="score-title">{{ c.title }}</text>
            </view>

            <view class="card card-note">
              <text v-for="(line, i) in c.lines" :key="i" class="note-p">{{ line }}</text>
            </view>

            <!-- 尾部留白：避免滚到底最后一张卡片贴住底栏 -->
            <view class="scroll-tail-spacer"></view>
        </view>
      </scroll-view>

      <view class="cmp-footer">
        <view class="btn-copy tap" @tap="onCopy">复制分析文案</view>
      </view>
    </view>

    <view v-if="modalItem" class="type-modal-root">
      <view class="type-modal-backdrop tap" @tap="closeModal"></view>
      <view class="type-modal-panel tap" @tap.stop="">
        <view class="type-modal-bar">
          <text class="type-modal-bar-title">性格类型说明</text>
          <text class="type-modal-bar-close tap" @tap="closeModal">关闭</text>
        </view>
        <scroll-view scroll-y enhanced class="type-modal-scroll" :show-scrollbar="false">
          <view class="type-modal-inner">
            <view class="type-modal-type-row">
              <text class="type-modal-code">{{ modalItem.type }}</text>
              <text class="type-modal-alias">{{ modalItem.alias }}</text>
            </view>
            <view v-if="modalItem.keywords.length" class="type-modal-keywords">
              <view v-for="k in modalItem.keywords" :key="k" class="type-modal-kw">{{ k }}</view>
            </view>
            <view class="type-modal-section">
              <text class="type-modal-st">类型简介</text>
              <text class="type-modal-body">{{ modalItem.summary }}</text>
            </view>
            <view class="type-modal-section">
              <text class="type-modal-st">性格优势</text>
              <text class="type-modal-body">{{ modalItem.strengths }}</text>
            </view>
            <view class="type-modal-section">
              <text class="type-modal-st">适合方向</text>
              <text class="type-modal-body">{{ modalItem.fit }}</text>
            </view>
          </view>
        </scroll-view>
        <view class="type-modal-footer">
          <view class="type-modal-done tap" @tap="closeModal">知道了</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";
import { IMG_QUESTION_BG } from "@/config/static-images";
import ZhiwoNavBar from "@/components/ZhiwoNavBar.vue";
import MBTI_LIST from "@/data/mbti-types";
import { minigameApp, type SessionQuizId } from "@/state/minigame-app";
import { analyzeComparison, buildComparisonText } from "@/utils/minigame/compare";
import {
  buildRecordResultPresentation,
  resolveRawRecordQuizId,
} from "@/utils/minigame/record-result-display";

interface TypeExplain {
  type: string;
  alias: string;
  keywords: string[];
  summary: string;
  strengths: string;
  fit: string;
}

interface CmpVm {
  selfTypesLabel: string;
  mutualTypesLabel: string;
  friendName: string;
  selfType: string;
  mutualType: string;
  selfAlias: string;
  mutualAlias: string;
  score: number;
  title: string;
  lines: string[];
}

function truncateName(name: string): string {
  if (!name) return "朋友";
  return name.length > 5 ? `${name.slice(0, 5)}...` : name;
}

function typeAlias(code: string): string {
  if (!code || code === "--") return "—";
  const u = String(code).trim().toUpperCase();
  const arr = MBTI_LIST as { type: string; alias?: string }[];
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i]?.type === u) return arr[i].alias || u;
  }
  return "未知类型";
}

function normalizeInfoType(raw: string): string {
  if (!raw || raw === "--") return "";
  const u = String(raw).trim().toUpperCase();
  if (/^[EI][SN][TF][JP]$/.test(u)) return u;
  return "";
}

function findTypeDetail(raw: string): TypeExplain | null {
  const u = normalizeInfoType(raw);
  if (!u) return null;
  const arr = MBTI_LIST as TypeExplain[];
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i]?.type === u) {
      const row = arr[i];
      return {
        type: row.type,
        alias: row.alias || "",
        keywords: Array.isArray(row.keywords) ? row.keywords : [],
        summary: row.summary || "",
        strengths: row.strengths || "",
        fit: row.fit || "",
      };
    }
  }
  return null;
}

const c = ref<CmpVm>({
  selfTypesLabel: "你的自测",
  mutualTypesLabel: "朋友眼中的你",
  friendName: "朋友",
  selfType: "--",
  mutualType: "--",
  selfAlias: "—",
  mutualAlias: "—",
  score: 0,
  title: "",
  lines: [],
});

const modalItem = ref<TypeExplain | null>(null);
const copyText = ref("");
const compareQuizId = ref<SessionQuizId>("mbti");

onLoad(() => {
  const ctx = minigameApp.compareContext as {
    quizId?: SessionQuizId;
    comparisonVariant?: string;
    selfTypesLabel?: string;
    mutualTypesLabel?: string;
    selfRecord?: { result?: { type?: string } };
    mutualRecord?: { friendNickName?: string; result?: { type?: string } };
  } | null;
  if (!ctx || !ctx.selfRecord || !ctx.mutualRecord) {
    uni.showToast({ title: "数据缺失", icon: "none" });
    setTimeout(() => uni.navigateBack(), 400);
    return;
  }
  compareQuizId.value =
    ctx.quizId ||
    resolveRawRecordQuizId(ctx.selfRecord) ||
    resolveRawRecordQuizId(ctx.mutualRecord);

  const comparisonVariant = ctx.comparisonVariant === "mutual_given" ? "mutual_given" : "default";
  const selfPres = buildRecordResultPresentation(ctx.selfRecord);
  const mutualPres = buildRecordResultPresentation(ctx.mutualRecord);
  const selfType = selfPres.typeCode || "--";
  const mutualType = mutualPres.typeCode || "--";
  const friendName = truncateName(ctx.mutualRecord.friendNickName || "朋友");

  let selfTypesLabel = "你的自测";
  let mutualTypesLabel = `${friendName}眼中的你`;
  if (comparisonVariant === "mutual_given") {
    selfTypesLabel = "对方的自测";
    mutualTypesLabel = "你给 TA 的互测";
  }
  if (typeof ctx.selfTypesLabel === "string" && ctx.selfTypesLabel.trim()) {
    selfTypesLabel = ctx.selfTypesLabel.trim();
  }
  if (typeof ctx.mutualTypesLabel === "string" && ctx.mutualTypesLabel.trim()) {
    mutualTypesLabel = ctx.mutualTypesLabel.trim();
  }

  const analysis = analyzeComparison(selfType, mutualType, comparisonVariant, compareQuizId.value);
  copyText.value = buildComparisonText(
    selfType,
    mutualType,
    friendName,
    comparisonVariant,
    compareQuizId.value,
  );

  c.value = {
    selfTypesLabel,
    mutualTypesLabel,
    friendName,
    selfType,
    mutualType,
    selfAlias: compareQuizId.value === "mbti" ? typeAlias(selfType) : selfPres.alias,
    mutualAlias: compareQuizId.value === "mbti" ? typeAlias(mutualType) : mutualPres.alias,
    score: analysis.score,
    title: analysis.title,
    lines: analysis.lines || [],
  };
});

function openModal(which: "self" | "mutual") {
  const code = which === "self" ? c.value.selfType : c.value.mutualType;
  if (compareQuizId.value !== "mbti") {
    if (!code || code === "--") {
      uni.showToast({ title: "暂无说明", icon: "none" });
      return;
    }
    uni.navigateTo({
      url: `/pages/info/index?quizId=${encodeURIComponent(compareQuizId.value)}&type=${encodeURIComponent(code)}`,
    });
    return;
  }
  const detail = findTypeDetail(code);
  if (!detail) {
    uni.showToast({ title: "该类型暂无法查看说明", icon: "none" });
    return;
  }
  modalItem.value = detail;
}

function closeModal() {
  modalItem.value = null;
}

function onCopy() {
  const t = copyText.value;
  if (!t) return;
  uni.setClipboardData({
    data: t,
    success: () => uni.showToast({ title: "已复制", icon: "none" }),
  });
}
</script>

<style lang="scss" scoped>
.z-cmp.page {
  position: relative;
  min-height: 100vh;
  height: 100vh;
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
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.scroll-area {
  flex: 1;
  min-height: 0;
  height: 0;
  padding: 16rpx 40rpx 0;
  box-sizing: border-box;
}

.cmp-scroll-inner {
  box-sizing: border-box;
  padding-bottom: 24rpx;
}

.card {
  background: rgba(255, 255, 255, 0.76);
  border-radius: 48rpx;
  border: 2rpx solid var(--qy-card-stroke);
  padding: 28rpx 32rpx;
  margin-bottom: 24rpx;
}

.types-row {
  display: flex;
}

.types-col {
  flex: 1;
  min-width: 0;
}

.types-col--right {
  padding-left: 16rpx;
  border-left: 2rpx solid rgba(0, 0, 0, 0.06);
}

.types-col--tap {
  padding: 12rpx 16rpx 16rpx;
  border-radius: 32rpx;
}

.types-label {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
}

.types-code {
  display: block;
  margin-top: 16rpx;
  font-size: 72rpx;
  font-weight: 700;
  color: rgba(30, 30, 30, 0.88);
}

.types-alias {
  display: block;
  margin-top: 12rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
}

.card-score .score-num {
  display: block;
  font-size: 96rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
}

.score-cap {
  display: block;
  margin-top: 8rpx;
  font-size: 44rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
}

.score-title {
  display: block;
  margin-top: 20rpx;
  font-size: 40rpx;
  line-height: 1.45;
  color: var(--qy-text-mute);
}

.note-p {
  display: block;
  font-size: 36rpx;
  line-height: 1.5;
  color: var(--qy-text-mute);
  margin-bottom: 16rpx;
}

.scroll-tail-spacer {
  height: 8rpx;
}

.cmp-footer {
  flex-shrink: 0;
  box-sizing: border-box;
  padding: 12rpx 40rpx 0;
  padding-bottom: calc(48rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom, 0px));
}

.btn-copy {
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

.type-modal-root {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 36rpx;
}

.type-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.type-modal-panel {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 704rpx;
  max-height: 82vh;
  background: rgba(255, 255, 255, 0.97);
  border-radius: 40rpx;
  border: 2rpx solid var(--qy-card-stroke);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.type-modal-bar {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  padding: 24rpx 28rpx 20rpx;
  border-bottom: 2rpx solid rgba(0, 0, 0, 0.06);
}

.type-modal-bar-title {
  font-size: 34rpx;
  font-weight: 700;
  color: rgba(40, 38, 36, 0.92);
}

.type-modal-bar-close {
  padding: 8rpx 16rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
}

.type-modal-scroll {
  min-height: 280rpx;
  height: 52vh;
  max-height: 56vh;
}

.type-modal-inner {
  padding: 28rpx 28rpx 12rpx;
}

.type-modal-type-row {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.type-modal-code {
  font-size: 72rpx;
  font-weight: 700;
  color: rgba(30, 30, 30, 0.88);
}

.type-modal-alias {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
}

.type-modal-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.type-modal-kw {
  padding: 0 18rpx;
  height: 52rpx;
  line-height: 52rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  background: var(--qy-lemon);
}

.type-modal-section {
  margin-top: 28rpx;
}

.type-modal-st {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.76);
}

.type-modal-body {
  display: block;
  margin-top: 10rpx;
  font-size: 30rpx;
  line-height: 1.55;
  color: rgba(0, 0, 0, 0.62);
}

.type-modal-footer {
  padding: 16rpx 28rpx calc(20rpx + env(safe-area-inset-bottom));
  border-top: 2rpx solid rgba(0, 0, 0, 0.06);
}

.type-modal-done {
  height: 92rpx;
  line-height: 92rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 38rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  background: var(--qy-lemon);
  border: 2rpx solid var(--qy-card-stroke);
}

.tap:active {
  opacity: 0.9;
}
</style>
