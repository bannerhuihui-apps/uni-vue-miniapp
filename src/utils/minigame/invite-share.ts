import { getIndexHubCarouselLabel } from "@/data/index-hub-carousel";
import type { SessionQuizId } from "@/state/minigame-app";
import { coerceRecordQuizId } from "@/utils/minigame/quiz-id";

export interface MutualInviteQuery {
  inviteId: string;
  ownerNickName: string;
  selfTestId: string;
  quizId: SessionQuizId;
  ownerResult: string;
}

export function decodeInviteQueryParam(raw: unknown): string {
  if (raw == null) return "";
  try {
    return decodeURIComponent(String(raw).trim());
  } catch {
    return String(raw).trim();
  }
}

/** 解析分享落地页 query（冷启动时 API 未返回前也可展示） */
export function parseMutualInviteQuery(raw: Record<string, unknown> | undefined): Partial<MutualInviteQuery> {
  const query = raw || {};
  const inviteId = decodeInviteQueryParam(query.inviteId);
  if (!inviteId) return {};
  const quizRaw = decodeInviteQueryParam(query.quizId);
  return {
    inviteId,
    ownerNickName: decodeInviteQueryParam(query.owner) || "朋友",
    selfTestId: decodeInviteQueryParam(query.selfTestId),
    quizId: quizRaw ? coerceRecordQuizId(quizRaw) : "mbti",
    ownerResult: decodeInviteQueryParam(query.ownerResult),
  };
}

export function buildMutualInviteSharePath(opts: {
  inviteId: string;
  ownerNickName: string;
  selfTestId: string;
  quizId: SessionQuizId;
  ownerResult?: string;
}): string {
  const parts = [
    `inviteId=${encodeURIComponent(opts.inviteId)}`,
    `owner=${encodeURIComponent(opts.ownerNickName)}`,
    `selfTestId=${encodeURIComponent(opts.selfTestId)}`,
    `quizId=${encodeURIComponent(opts.quizId)}`,
  ];
  const result = (opts.ownerResult || "").trim();
  if (result && result !== "--") {
    parts.push(`ownerResult=${encodeURIComponent(result)}`);
  }
  return `/pages/mutual-invite/index?${parts.join("&")}`;
}

/** 微信分享卡片标题：不在文案中暴露具体档位，结果仍通过 query 传递 */
export function buildMutualInviteShareTitle(
  ownerNickName: string,
  quizId: SessionQuizId,
  typeCode: string,
): string {
  const nick = (ownerNickName || "我").trim() || "我";
  const quizLabel = getIndexHubCarouselLabel(quizId);
  const result = (typeCode || "").trim();
  const hasResult = !!result && result !== "--";

  if (hasResult) {
    return `${nick}已完成了「${quizLabel}」的测试，来帮TA互测一下`;
  }
  if (quizId === "mbti") {
    return `${nick}邀请你来性格互测`;
  }
  return `${nick}邀请你完成「${quizLabel}」互测`;
}

export function getMutualQuizNavTitle(quizId: SessionQuizId, ownerName?: string): string {
  const label = getIndexHubCarouselLabel(quizId);
  const owner = (ownerName || "").trim();
  if (owner) return `为 ${owner} · ${label}`;
  return `${label}互测`;
}

export function getMutualInviteButtonLabel(ownerShort: string, quizId: SessionQuizId): string {
  const label = getIndexHubCarouselLabel(quizId);
  return `为${ownerShort}完成${label}`;
}
