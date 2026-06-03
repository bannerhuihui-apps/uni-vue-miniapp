/** zhiwo/utils/persist-quiz.js */
import * as mg from "@/api/minigame";
import { minigameApp, type SessionQuizId } from "@/state/minigame-app";
import { publicAvatarUrl } from "@/utils/minigame/avatar-url";
import { getAppId } from "@/utils/minigame/app-env";
import { getApiSource } from "@/utils/minigame/session";
import { hasUsableWechatProfile } from "@/utils/minigame/profile-guard";

function coerceSessionQuizId(raw: unknown): SessionQuizId {
  if (raw === "darkness_trend" || raw === "peach_blossom" || raw === "crush_index" || raw === "birth_color") {
    return raw;
  }
  return "mbti";
}

export function flushPendingQuizSubmit(): Promise<boolean> {
  const p = minigameApp.pendingQuizPersist;
  if (!p || !minigameApp.userId || minigameApp.authStatus !== "success") {
    return Promise.resolve(false);
  }
  if (!hasUsableWechatProfile(minigameApp.profile)) {
    return Promise.resolve(false);
  }

  minigameApp.currentResult = p.result;
  const qid: SessionQuizId = coerceSessionQuizId(p.quizId);
  minigameApp.lastQuizContext = {
    mode: p.mode === "mutual" ? "mutual" : "self",
    inviteId: p.inviteId || "",
    quizId: qid,
  };
  minigameApp.sessionQuizId = qid;

  const createdAt = typeof p.createdAt === "number" ? p.createdAt : Date.now();

  if (p.mode === "self") {
    const recId = `${createdAt}_${Math.floor(Math.random() * 1e6)}`;
    const prev = Array.isArray(minigameApp.records) ? [...(minigameApp.records as object[])] : [];
    minigameApp.records = [
      {
        id: recId,
        mode: "self",
        createdAt,
        answers: p.answers.slice(),
        result: p.result,
        mutualCount: 0,
        todayMutualCount: 0,
        quizId: qid,
      },
      ...prev,
    ];

    return mg
      .mgSaveRecord({
        userId: minigameApp.userId,
        mode: "self",
        answers: p.answers,
        result: p.result,
        createdAt,
        selfTestId: recId,
        appId: getAppId(),
        source: getApiSource(),
        quizId: qid,
      })
      .then(() => {
        minigameApp.pendingQuizPersist = null;
        return true;
      })
      .catch(() => {
        uni.showToast({
          title: "结果云端保存失败，可稍后在测试记录重试同步",
          icon: "none",
          duration: 2800,
        });
        minigameApp.pendingQuizPersist = null;
        return true;
      });
  }

  if (p.mode === "mutual") {
    const inv = minigameApp.invite || {};
    const inviteId = String(inv.inviteId || p.inviteId || "").trim();
    if (!inviteId) {
      minigameApp.pendingQuizPersist = null;
      uni.showToast({ title: "邀请信息已失效，未能提交", icon: "none" });
      return Promise.resolve(false);
    }
    const prof = minigameApp.profile || {};
    return mg
      .mgCompleteInvite({
        inviteId,
        friendUserId: minigameApp.userId,
        friendNickName: (prof.nickName as string) || "",
        friendAvatarUrl: publicAvatarUrl((prof.avatarUrl as string) || ""),
        answers: p.answers.slice(),
        result: p.result,
        createdAt,
        quizId: qid,
      })
      .then(() => {
        minigameApp.pendingQuizPersist = null;
        uni.showToast({ title: "已提交给对方", icon: "none" });
        return true;
      })
      .catch(() => {
        uni.showToast({ title: "互测结果提交失败", icon: "none" });
        minigameApp.pendingQuizPersist = null;
        return true;
      });
  }

  minigameApp.pendingQuizPersist = null;
  return Promise.resolve(false);
}
