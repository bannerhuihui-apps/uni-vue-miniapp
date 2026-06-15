<template>
  <view class="page z-mu-inv">
    <image class="layer-bg" :src="IMG_INDEX_BG" mode="aspectFill" aria-hidden="true" />
    <view class="ui-layer">
      <!-- 与 zhiwo / 首页一致：整页 flex 列，不用 scroll-view（否则 flex 居中无效） -->
      <view class="body">
        <view class="copy-block">
          <text class="lead">
            {{ ownerDecorated }}邀请你完成「{{ quizLabel }}」互测，请根据你对 TA 的了解如实选择。
          </text>
          <text class="hint">
            若你也想测一测自己，可点击下方<text class="action-ref">「进入主页」</text>，选择自测入口参与测试。
          </text>
        </view>

        <view class="actions-zone">
          <view class="actions">
            <view class="btn-lemon tap" @tap="startMutualQuiz">{{ startButtonLabel }}</view>
            <view class="btn-lemon btn-second tap" @tap="goHome">进入主页</view>
          </view>
        </view>
      </view>

      <view class="mu-inv-footer safe-bottom">
        <view class="notice-line">测试结果仅供娱乐，不具有任何指向性及指导性，请玩家适度娱乐。</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onShow, onUnload } from "@dcloudio/uni-app";
import { IMG_INDEX_BG } from "@/config/static-images";
import * as mg from "@/api/minigame";
import { getIndexHubCarouselLabel } from "@/data/index-hub-carousel";
import { minigameApp, type SessionQuizId } from "@/state/minigame-app";
import { reLaunchIndexHome } from "@/utils/minigame/index-home";
import {
  decodeInviteQueryParam,
  getMutualInviteButtonLabel,
  parseMutualInviteQuery,
} from "@/utils/minigame/invite-share";
import { coerceRecordQuizId } from "@/utils/minigame/quiz-id";
import {
  isUiPreviewQuery,
  parsePreviewQuizId,
  seedMutualInvitePreview,
} from "@/utils/minigame/ui-preview";

/** 体验版测试可 true；正式上架前改回 false（禁止发起人打开自己的互测邀请） */
const DEBUG_ALLOW_SELF_MUTUAL = false;

const uiPreview = ref(false);
/** 邀请发起人 userId（接口返回后写入，用于本人互测拦截） */
const inviteOwnerUserIdRef = ref("");
/** 邀请详情是否已从服务端加载完成 */
const inviteLoadedRef = ref(false);

function shortForButton(name: string, maxLen = 6): string {
  const s = (name || "朋友").trim();
  if (!s) return "朋友";
  if (s.length <= maxLen) return s;
  return `${s.slice(0, maxLen)}…`;
}

const ownerName = ref("朋友");
const ownerShort = ref("朋友");
const quizIdRef = ref<SessionQuizId>("mbti");
const ownerResultRef = ref("");

const ownerDecorated = computed(() => `「${ownerName.value}」`);
const quizLabel = computed(() => getIndexHubCarouselLabel(quizIdRef.value));
const startButtonLabel = computed(() => getMutualInviteButtonLabel(ownerShort.value, quizIdRef.value));

function applyInviteState(
  invite: {
    inviteId: string;
    ownerUserId?: string;
    ownerNickName?: string;
    selfTestId?: string;
    targetName?: string;
    quizId?: SessionQuizId;
    ownerResult?: string;
  },
  query: Record<string, string | undefined>,
) {
  minigameApp.invite = invite;
  minigameApp.sessionQuizId = invite.quizId || "mbti";
  quizIdRef.value = invite.quizId || "mbti";
  if (invite.ownerResult) ownerResultRef.value = invite.ownerResult;
  syncName(query);
}

function applyQueryFallback(query: Record<string, string | undefined>) {
  const parsed = parseMutualInviteQuery(query);
  if (!parsed.inviteId) return;
  // 仅用于接口失败时的展示兜底，不写入 invite，避免缺少 ownerUserId 时绕过本人互测拦截
  ownerName.value = parsed.ownerNickName || "朋友";
  ownerShort.value = shortForButton(ownerName.value);
  if (parsed.quizId) quizIdRef.value = parsed.quizId;
}

function syncName(query: Record<string, string | undefined>) {
  const inv = minigameApp.invite;
  const owner = query.owner ? decodeInviteQueryParam(query.owner) : "";
  const nm =
    (inv && String((inv as { ownerNickName?: string }).ownerNickName || "").trim()) ||
    owner ||
    "朋友";
  ownerName.value = nm;
  ownerShort.value = shortForButton(nm);

  const fromQuery = query.ownerResult ? decodeInviteQueryParam(query.ownerResult) : "";
  const fromInvite = inv ? String((inv as { ownerResult?: string }).ownerResult || "").trim() : "";
  if (fromInvite && fromInvite !== "--") ownerResultRef.value = fromInvite;
  else if (fromQuery && fromQuery !== "--") ownerResultRef.value = fromQuery;
}

onLoad((raw) => {
  const query = (raw || {}) as Record<string, string | undefined>;
  uiPreview.value = isUiPreviewQuery(query);

  if (uiPreview.value) {
    const quizId = parsePreviewQuizId(query);
    const invite = seedMutualInvitePreview(quizId);
    applyInviteState(
      {
        inviteId: invite.inviteId,
        ownerNickName: invite.ownerNickName,
        selfTestId: invite.selfTestId,
        quizId: invite.quizId,
        ownerResult: invite.ownerResult,
      },
      query,
    );
    return;
  }

  const inviteId = query.inviteId ? decodeInviteQueryParam(query.inviteId) : "";
  if (!inviteId) {
    ownerName.value = "朋友";
    ownerShort.value = "朋友";
    return;
  }

  applyQueryFallback(query);

  uni.showLoading({ title: "加载邀请", mask: true });
  mg.mgGetInvite(inviteId)
    .then((inviteRaw) => {
      uni.hideLoading();
      const invite = inviteRaw as {
        inviteId?: string;
        ownerUserId?: string;
        ownerNickName?: string;
        selfTestId?: string;
        targetName?: string;
        quizId?: string;
      };
      if (!invite || !invite.inviteId) {
        uni.showToast({ title: "邀请不存在或已失效", icon: "none" });
        inviteLoadedRef.value = false;
        minigameApp.invite = null;
        applyQueryFallback(query);
        return;
      }
      inviteOwnerUserIdRef.value = String(invite.ownerUserId || "").trim();
      if (blockSelfMutual(invite.ownerUserId)) {
        inviteLoadedRef.value = false;
        return;
      }
      const resolvedQuizId: SessionQuizId = invite.quizId
        ? coerceRecordQuizId(invite.quizId)
        : query.quizId
          ? coerceRecordQuizId(decodeInviteQueryParam(query.quizId))
          : quizIdRef.value;
      inviteLoadedRef.value = true;
      applyInviteState(
        {
          inviteId: invite.inviteId,
          ownerUserId: invite.ownerUserId,
          ownerNickName: invite.ownerNickName || ownerName.value,
          selfTestId:
            invite.selfTestId ||
            (query.selfTestId ? decodeInviteQueryParam(query.selfTestId) : ""),
          targetName: invite.targetName,
          quizId: resolvedQuizId,
          ownerResult: ownerResultRef.value,
        },
        query,
      );
    })
    .catch(() => {
      uni.hideLoading();
      inviteLoadedRef.value = false;
      minigameApp.invite = null;
      applyQueryFallback(query);
    });
});

function isSelfMutualOwner(ownerUserId?: string | null): boolean {
  if (DEBUG_ALLOW_SELF_MUTUAL) return false;
  const owner = String(
    ownerUserId ?? inviteOwnerUserIdRef.value ?? (minigameApp.invite as { ownerUserId?: string } | null)?.ownerUserId ?? "",
  ).trim();
  const uid = String(minigameApp.userId || "").trim();
  return !!(owner && uid && owner === uid);
}

function blockSelfMutual(ownerUserId?: string | null): boolean {
  if (!isSelfMutualOwner(ownerUserId)) return false;
  uni.showToast({ title: "不能评价自己，请邀请朋友来测", icon: "none" });
  minigameApp.invite = null;
  inviteOwnerUserIdRef.value = "";
  inviteLoadedRef.value = false;
  ownerName.value = "朋友";
  ownerShort.value = "朋友";
  return true;
}

function revalidateSelfMutualBlock() {
  if (!inviteOwnerUserIdRef.value && !minigameApp.invite) return;
  blockSelfMutual();
}

onShow(() => {
  revalidateSelfMutualBlock();
});

uni.$on("minigame-auth-resolved", revalidateSelfMutualBlock);
onUnload(() => {
  uni.$off("minigame-auth-resolved", revalidateSelfMutualBlock);
});

function startMutualQuiz() {
  if (!inviteLoadedRef.value) {
    uni.showToast({ title: "邀请加载中，请稍候", icon: "none" });
    return;
  }
  if (blockSelfMutual()) return;
  const inv = minigameApp.invite as { inviteId?: string; quizId?: SessionQuizId } | null;
  if (!inv || !inv.inviteId) {
    uni.showToast({ title: "请通过邀请链接进入", icon: "none" });
    return;
  }
  const qid = encodeURIComponent(String(inv.quizId || minigameApp.sessionQuizId || "mbti"));
  const previewQ = uiPreview.value ? "&preview=1" : "";
  uni.navigateTo({
    url: `/pages/quiz/index?mode=mutual&inviteId=${encodeURIComponent(String(inv.inviteId))}&quizId=${qid}${previewQ}`,
  });
}

function goHome() {
  const inv = minigameApp.invite as { quizId?: SessionQuizId } | null;
  reLaunchIndexHome(inv?.quizId || minigameApp.sessionQuizId);
}
</script>

<style lang="scss" scoped>
.z-mu-inv.page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
  background: var(--qy-page-tint);
}

.layer-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.ui-layer {
  position: relative;
  z-index: 4;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 0;
  padding-top: env(safe-area-inset-top);
}

.body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  /* 与 index 背景主标题区错开（zhiwo 约 612rpx，此处用 vh 适配） */
  padding: 46vh 64rpx 0;
  box-sizing: border-box;
}

.copy-block {
  flex-shrink: 0;
}

.actions-zone {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24rpx 0 16rpx;
  box-sizing: border-box;
}

.actions {
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
}

.mu-inv-footer {
  flex-shrink: 0;
  padding-left: 64rpx;
  padding-right: 64rpx;
  box-sizing: border-box;
}

.safe-bottom {
  padding-bottom: calc(72rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(72rpx + env(safe-area-inset-bottom, 0px));
}

.lead {
  display: block;
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.55;
  color: rgba(32, 32, 32, 0.88);
}

.name-mark {
  color: var(--qy-link-strong);
  font-weight: 700;
}

.hint {
  display: block;
  text-align: center;
  margin-top: 28rpx;
  font-size: 24rpx;
  line-height: 1.55;
  color: var(--qy-text-mute);
}

.action-ref {
  color: var(--qy-link-strong);
  font-weight: 700;
}

.btn-lemon {
  height: 112rpx;
  line-height: 112rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 44rpx;
  font-weight: 700;
  color: var(--qy-link-strong);
  background: var(--qy-lemon);
  border: 2rpx solid var(--qy-card-stroke);
  box-shadow: var(--qy-card-shadow);
  box-sizing: border-box;
}

.btn-second {
  margin-top: 36rpx;
}

.notice-line {
  flex-shrink: 0;
  padding-top: 24rpx;
  text-align: center;
  font-size: 26rpx;
  line-height: 1.45;
  color: rgba(140, 134, 130, 0.95);
  padding-left: 12rpx;
  padding-right: 12rpx;
  box-sizing: border-box;
}

.tap:active {
  opacity: 0.92;
}
</style>
