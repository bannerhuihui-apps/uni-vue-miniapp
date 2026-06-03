/**
 * 互测相关页面 UI 预览
 * 用法：首页齿轮 → 设置 → UI 演示 → 互测预览；或直接带 ?preview=1&quizId=...
 *
 * 可用环境：微信开发者工具(develop)、体验版(trial)、H5/ dev 构建。
 * 正式版 release 自动关闭。
 */
import { darknessTrendQuestions } from "@/data/quiz-darkness-trend";
import { peachBlossomQuestions } from "@/data/quiz-peach-blossom";
import { crushIndexQuestions } from "@/data/quiz-crush-index";
import { birthColorQuestions } from "@/data/quiz-birth-color";
import { getIndexHubCarouselLabel } from "@/data/index-hub-carousel";
import { minigameApp, type SessionQuizId } from "@/state/minigame-app";
import { settleDarknessTrendAnswers } from "@/utils/minigame/darkness-quiz-adapter";
import { settlePeachBlossomAnswers } from "@/utils/minigame/peach-quiz-adapter";
import { settleCrushIndexAnswers } from "@/utils/minigame/crush-quiz-adapter";
import { settleBirthColorAnswers } from "@/utils/minigame/birth-color-quiz-adapter";
import { coerceRecordQuizId } from "@/utils/minigame/quiz-id";

export const UI_PREVIEW_INVITE_ID = "ui-preview-invite";

function readMiniProgramEnvVersion(): string {
  try {
    const u = uni as { getAccountInfoSync?: () => { miniProgram?: { envVersion?: string } } };
    return String(u.getAccountInfoSync?.()?.miniProgram?.envVersion || "").trim();
  } catch {
    return "";
  }
}

/**
 * 运行时判断是否允许 UI 预览。
 * 即使用 `build:mp-weixin` 产物在微信开发者工具里打开，envVersion=develop 也会返回 true。
 */
export function isUiPreviewEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  if (import.meta.env.MODE !== "production") return true;
  const env = readMiniProgramEnvVersion();
  return env === "develop" || env === "trial";
}

/** @deprecated 编译期常量，勿用于界面 v-if；请用 isUiPreviewEnabled() */
export const UI_PREVIEW_ENABLED = import.meta.env.MODE !== "production";

const PREVIEW_OWNER = "小知";

/** 各套题邀请页展示的 TA 自测档位（演示用） */
const PREVIEW_OWNER_RESULT: Record<SessionQuizId, string> = {
  mbti: "INFJ",
  darkness_trend: "人间四月天",
  peach_blossom: "慢热桃花",
  crush_index: "心动选手",
  birth_color: "暖色系",
};

export const MUTUAL_UI_PREVIEW_QUIZ_OPTIONS: { id: SessionQuizId; label: string }[] = [
  { id: "mbti", label: "MBTI" },
  { id: "darkness_trend", label: "黑化趋势" },
  { id: "peach_blossom", label: "桃花体质" },
  { id: "crush_index", label: "花痴指数" },
  { id: "birth_color", label: "本命颜色" },
];

export function isUiPreviewQuery(q: Record<string, unknown> | undefined): boolean {
  if (!isUiPreviewEnabled() || !q) return false;
  const v = q.preview;
  return v === "1" || v === 1 || v === true || String(v ?? "").trim() === "1";
}

export function parsePreviewQuizId(q: Record<string, unknown> | undefined): SessionQuizId {
  const raw = q?.quizId != null ? decodeURIComponent(String(q.quizId)).trim() : "";
  return raw ? coerceRecordQuizId(raw) : minigameApp.sessionQuizId || "mbti";
}

export function parsePreviewQuestionIndex(q: Record<string, unknown> | undefined): number {
  const raw = q?.qIndex != null ? parseInt(String(q.qIndex), 10) : 0;
  return Number.isFinite(raw) && raw > 0 ? raw : 0;
}

function repeatLetter(count: number, letter = "B"): string[] {
  return Array(Math.max(count, 0)).fill(letter);
}

/** 生成各套题互测完成后的演示 result（与真实结算结构一致） */
export function buildPreviewMutualResult(quizId: SessionQuizId): {
  type: string;
  counts: Record<string, number>;
} {
  switch (quizId) {
    case "darkness_trend":
      return settleDarknessTrendAnswers(
        repeatLetter(darknessTrendQuestions.length),
        darknessTrendQuestions,
        true,
      );
    case "peach_blossom":
      return settlePeachBlossomAnswers(
        repeatLetter(peachBlossomQuestions.length),
        peachBlossomQuestions,
      );
    case "crush_index":
      return settleCrushIndexAnswers(repeatLetter(crushIndexQuestions.length), crushIndexQuestions);
    case "birth_color":
      return settleBirthColorAnswers(repeatLetter(birthColorQuestions.length), birthColorQuestions);
    default:
      return {
        type: "ENFP",
        counts: { I: 3, E: 7, S: 4, N: 6, T: 2, F: 8, J: 3, P: 7 },
      };
  }
}

/** 写入 global 互测邀请上下文，供邀请页 / 答题页 / 结果页共用 */
export function seedMutualInvitePreview(quizId: SessionQuizId) {
  const invite = {
    inviteId: UI_PREVIEW_INVITE_ID,
    ownerUserId: "ui-preview-owner",
    ownerNickName: PREVIEW_OWNER,
    targetName: PREVIEW_OWNER,
    selfTestId: "ui-preview-self",
    quizId,
    ownerResult: PREVIEW_OWNER_RESULT[quizId] || "--",
  };
  minigameApp.invite = invite;
  minigameApp.sessionQuizId = quizId;
  return invite;
}

export function seedMutualResultPreview(quizId: SessionQuizId) {
  seedMutualInvitePreview(quizId);
  minigameApp.currentResult = buildPreviewMutualResult(quizId);
  minigameApp.lastQuizContext = {
    mode: "mutual",
    inviteId: UI_PREVIEW_INVITE_ID,
    quizId,
  };
}

export function buildMutualInvitePreviewUrl(quizId: SessionQuizId): string {
  const ownerResult = PREVIEW_OWNER_RESULT[quizId] || "";
  return (
    `/pages/mutual-invite/index?preview=1&quizId=${encodeURIComponent(quizId)}` +
    `&inviteId=${encodeURIComponent(UI_PREVIEW_INVITE_ID)}` +
    `&owner=${encodeURIComponent(PREVIEW_OWNER)}` +
    `&ownerResult=${encodeURIComponent(ownerResult)}`
  );
}

export function buildMutualQuizPreviewUrl(quizId: SessionQuizId, qIndex = 0): string {
  seedMutualInvitePreview(quizId);
  const qi = Math.max(0, Math.floor(qIndex));
  const qPart = qi > 0 ? `&qIndex=${qi}` : "";
  return (
    `/pages/quiz/index?preview=1&mode=mutual&inviteId=${encodeURIComponent(UI_PREVIEW_INVITE_ID)}` +
    `&quizId=${encodeURIComponent(quizId)}${qPart}`
  );
}

export function buildMutualResultPreviewUrl(quizId: SessionQuizId): string {
  seedMutualResultPreview(quizId);
  return `/pages/result/index?preview=1&quizId=${encodeURIComponent(quizId)}`;
}

export function previewQuizLabel(quizId: SessionQuizId): string {
  return getIndexHubCarouselLabel(quizId);
}
