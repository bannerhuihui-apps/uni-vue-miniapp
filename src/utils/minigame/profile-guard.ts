/** zhiwo/utils/profile-guard.js */
import type { MinigameProfileState } from "@/state/minigame-app";

const PLACEHOLDER_NICKNAMES = new Set(["微信用户", "WeChat User", ""]);

export function isPlaceholderNickname(name?: string): boolean {
  const n = (name || "").trim();
  return !n || PLACEHOLDER_NICKNAMES.has(n);
}

export function hasUsableWechatProfile(profile: MinigameProfileState | null | undefined): boolean {
  if (!profile || profile.skipped) return false;
  if (isPlaceholderNickname(profile.nickName)) return false;
  if (!(profile.avatarUrl && String(profile.avatarUrl).trim())) return false;
  return true;
}
