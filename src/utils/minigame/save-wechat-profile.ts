import * as mg from "@/api/minigame";
import { minigameApp } from "@/state/minigame-app";
import { prepareAvatarLocalPath } from "@/utils/minigame/avatar-local-path";
import { getAppId } from "@/utils/minigame/app-env";
import { getApiSource, refreshProfile } from "@/utils/minigame/session";

export async function persistWechatChosenProfile(payload: {
  nickName: string;
  avatarDraftUrl: string;
}): Promise<void> {
  const userId = minigameApp.userId;
  if (!userId) throw new Error("请先完成微信登录");
  const nickName = (payload.nickName || "").trim();
  const draft = (payload.avatarDraftUrl || "").trim();
  const localPath = await prepareAvatarLocalPath(draft);
  const up = await mg.mgUploadAvatar(localPath, userId);
  const avatarStoredUrl = String((up as { url?: string }).url ?? "").trim();
  if (!avatarStoredUrl) throw new Error("头像上传异常");
  await mg.mgSaveProfile({
    userId,
    nickName,
    avatarUrl: avatarStoredUrl,
    skipped: false,
    appId: getAppId(),
    source: getApiSource(),
  });
  await refreshProfile();
}
