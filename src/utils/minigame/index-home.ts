import { minigameApp, type SessionQuizId } from "@/state/minigame-app";
import { coerceRecordQuizId } from "@/utils/minigame/quiz-id";

/** 解析应回到首页时保留的套题（URL 参数 > session > 最近答题 > 花痴指数） */
export function resolveIndexHomeQuizId(explicit?: unknown): SessionQuizId {
  if (explicit != null && String(explicit).trim()) {
    return coerceRecordQuizId(String(explicit).trim());
  }
  if (minigameApp.sessionQuizId) {
    return minigameApp.sessionQuizId;
  }
  const fromLast = minigameApp.lastQuizContext?.quizId;
  if (fromLast) {
    return coerceRecordQuizId(fromLast);
  }
  return "crush_index";
}

export function indexHomeUrl(quizId?: SessionQuizId | string): string {
  const q = resolveIndexHomeQuizId(quizId);
  return `/pages/index/index?quizId=${encodeURIComponent(q)}`;
}

/** reLaunch 回首页并同步 sessionQuizId / 轮播选中项 */
export function reLaunchIndexHome(quizId?: SessionQuizId | string): void {
  const resolved = resolveIndexHomeQuizId(quizId);
  minigameApp.sessionQuizId = resolved;
  uni.reLaunch({ url: indexHomeUrl(resolved) });
}

/** redirectTo 回首页（登录门禁等场景） */
export function redirectToIndexHome(quizId?: SessionQuizId | string): void {
  const resolved = resolveIndexHomeQuizId(quizId);
  minigameApp.sessionQuizId = resolved;
  uni.redirectTo({ url: indexHomeUrl(resolved) });
}
