/**
 * zhiwo/utils/session.js — 使用 minigameApp 替代 globalData
 */
import * as mg from "@/api/minigame";
import { MINIGAME_API_SOURCE } from "@/config/minigame";
import { minigameApp } from "@/state/minigame-app";
import { normalizeSelfRecords, type NormalizedSelfRecord } from "@/utils/minigame/normalize-records";
import { syncRecordMutualCounts } from "@/utils/minigame/record-sync";
import { getAppId } from "@/utils/minigame/app-env";

export function getApiSource(): string {
  return MINIGAME_API_SOURCE || "minigame";
}

export { getAppId };

function loginWithWechat(): Promise<{ userId?: string }> {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: "weixin",
      success: (res) => {
        const code = (res as { code?: string }).code;
        if (!code) reject(new Error("未获取到登录 code"));
        else mg.mgLogin({ code }).then(resolve).catch(reject);
      },
      fail: (e) => reject(new Error((e as { errMsg?: string })?.errMsg || "登录失败")),
    });
  });
}

export async function loadRemoteProfile(userId: string): Promise<unknown> {
  if (!userId) return null;
  try {
    const profile = (await mg.mgGetProfile(userId)) as {
      skipped?: boolean;
      nickName?: string;
      avatarUrl?: string;
    } | null;
    if (profile && !profile.skipped) {
      minigameApp.profile = {
        nickName: profile.nickName || "",
        avatarUrl: profile.avatarUrl || "",
      };
    } else if (profile && profile.skipped) {
      minigameApp.profile = { skipped: true };
    } else {
      minigameApp.profile = null;
    }
    return minigameApp.profile;
  } catch {
    minigameApp.profile = null;
    return null;
  }
}

/** 与 zhiwo pages/records 中 _recordsRefreshPromise 一致：同级参数合并到同一次远端拉取，避免交错覆盖 */
const recordsInflight = new Map<string, Promise<NormalizedSelfRecord[]>>();

export async function loadRemoteRecords(
  userId: string,
  opts?: { keepOnError?: boolean },
): Promise<NormalizedSelfRecord[]> {
  const keepOnError = !!(opts && opts.keepOnError);
  if (!userId) return [];
  const laneKey = `${userId}:${keepOnError ? "1" : "0"}`;
  const existing = recordsInflight.get(laneKey);
  if (existing) return existing;

  const promise = (async (): Promise<NormalizedSelfRecord[]> => {
    try {
      const payload = await mg.mgListRecords(userId);
      /** zhiwo：normalizeSelfRecords 内已对非数组归一成 []；此处再收口一次异常数据结构 */
      const normalized = normalizeSelfRecords(payload);
      minigameApp.records = [...normalized];

      await Promise.all(
        normalized.map((rec) =>
          mg
            .mgGetMutualResults(rec.id)
            .then((list) => {
              syncRecordMutualCounts(normalized as NormalizedSelfRecord[], rec.id, list as { createdAt?: unknown }[]);
            })
            .catch(() => {}),
        ),
      );
      minigameApp.records = [...normalized];
      return normalized;
    } catch {
      if (!keepOnError) minigameApp.records = [];
      return [];
    }
  })().finally(() => {
    recordsInflight.delete(laneKey);
  });

  recordsInflight.set(laneKey, promise);
  return promise;
}

export function notifyPagesAuthResolved(): void {
  try {
    uni.$emit?.("minigame-auth-resolved");
  } catch {
    /* 无 emit */
  }
}

export function performLogin(showFailureToast?: boolean): Promise<void> {
  minigameApp.authStatus = "loading";
  minigameApp.authError = "";
  minigameApp.userId = "";

  return loginWithWechat()
    .then(async (loginRes) => {
      const userId = (loginRes && loginRes.userId) || "";
      if (!userId) throw new Error("未获取到 userId");
      minigameApp.userId = userId;
      minigameApp.authError = "";
      await Promise.all([loadRemoteProfile(userId), loadRemoteRecords(userId)]);
      minigameApp.authStatus = "success";
      notifyPagesAuthResolved();
    })
    .catch((err: Error) => {
      minigameApp.authStatus = "fail";
      minigameApp.authError = (err && err.message) || "微信登录失败，请重试";
      minigameApp.userId = "";
      minigameApp.records = [];
      minigameApp.profile = null;
      if (showFailureToast) {
        uni.showToast({ title: minigameApp.authError, icon: "none" });
      }
      notifyPagesAuthResolved();
      throw err;
    });
}

export function ensureLogin(showFailureToast?: boolean): Promise<void> {
  return performLogin(!!showFailureToast);
}

export function refreshProfile(): Promise<unknown | null> {
  const userId = minigameApp.userId;
  if (!userId) return Promise.resolve(null);
  return loadRemoteProfile(userId);
}
