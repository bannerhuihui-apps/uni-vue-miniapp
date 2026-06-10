/**
 * zhiwo/utils/api.js → uni.request / uni.uploadFile
 */
import { MINIGAME_API_BASE_URL } from "@/config/minigame";

const REQUEST_TIMEOUT_MS = 20000;

function parseResponseData(raw: unknown): Record<string, unknown> {
  if (raw == null) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof raw === "object") return raw as Record<string, unknown>;
  return {};
}

export async function mgRequest(method: string, path: string, data?: Record<string, unknown>): Promise<unknown> {
  if (!MINIGAME_API_BASE_URL) throw new Error("apiBaseUrl 未配置");

  const isPostLike = method === "POST" || method === "PUT" || method === "PATCH";
  const isGet = method === "GET";
  const res = await uni.request({
    url: `${MINIGAME_API_BASE_URL}${path}`,
    method: method as "GET" | "POST",
    timeout: REQUEST_TIMEOUT_MS,
    ...(isGet ? {} : { data: data ?? {} }),
    header: isPostLike ? { "content-type": "application/json" } : {},
  });

  const statusCode = res.statusCode;
  if (statusCode === undefined || statusCode < 200 || statusCode >= 300) {
    throw new Error(`HTTP ${statusCode ?? ""}`);
  }
  const body = parseResponseData(res.data as unknown);
  const code = body.code;
  if (code != null && Number(code) !== 2000) {
    const fromData = typeof body.data === "string" ? body.data : "";
    const msg = fromData || (body.message as string) || "接口调用失败";
    throw new Error(msg);
  }
  if (Object.prototype.hasOwnProperty.call(body, "data")) return body.data;
  return body;
}

export function mgLogin(data: { code: string }) {
  return mgRequest("POST", "/auth/login", data);
}

export function mgSaveProfile(data: Record<string, unknown>) {
  return mgRequest("POST", "/storage/profile", data);
}

export function mgGetProfile(userId: string) {
  return mgRequest("GET", `/storage/profile/${encodeURIComponent(userId)}`);
}

export function mgSaveRecord(data: Record<string, unknown>) {
  return mgRequest("POST", "/storage/record", data);
}

export function mgListRecords(userId: string, opts?: { quizId?: string }) {
  const qid = opts?.quizId ? String(opts.quizId).trim() : "";
  const suffix = qid ? `?quizId=${encodeURIComponent(qid)}` : "";
  return mgRequest("GET", `/storage/records/${encodeURIComponent(userId)}${suffix}`);
}

export function mgSyncRecords(data: Record<string, unknown>) {
  return mgRequest("POST", "/storage/records/sync", data);
}

export function mgCreateInvite(data: Record<string, unknown>) {
  return mgRequest("POST", "/storage/invite", data);
}

export function mgGetInvite(inviteId: string) {
  return mgRequest("GET", `/storage/invite/${encodeURIComponent(inviteId)}`);
}

export function mgListInvites(ownerUserId: string) {
  return mgRequest("GET", `/storage/invites/${encodeURIComponent(ownerUserId)}`);
}

export function mgCompleteInvite(data: Record<string, unknown>) {
  return mgRequest("POST", "/storage/invite/complete", data);
}

export function mgGetMutualResults(selfTestId: string) {
  return mgRequest("GET", `/storage/mutual-results/${encodeURIComponent(selfTestId)}`);
}

export function mgListMutualGiven(friendUserId: string) {
  return mgRequest("GET", `/storage/mutual-given/${encodeURIComponent(friendUserId)}`);
}

export function mgWipeUserTestData(data: Record<string, unknown>) {
  return mgRequest("POST", "/storage/user-data/wipe", data);
}

export function mgAiEligibility(userId: string) {
  return mgRequest("GET", `/ai/eligibility/${encodeURIComponent(userId)}`) as Promise<
    import("@/utils/minigame/ai-analysis-gate").AiEligibilityResult
  >;
}

export function mgAiReport(userId: string) {
  return mgRequest("POST", "/ai/report", { userId }) as Promise<
    import("@/utils/minigame/ai-analysis-gate").AiReportResult
  >;
}

export function mgUploadAvatar(localFilePath: string, userId: string): Promise<{ url?: string } & unknown> {
  if (!MINIGAME_API_BASE_URL) return Promise.reject(new Error("apiBaseUrl 未配置"));
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${MINIGAME_API_BASE_URL}/storage/upload/image`,
      filePath: localFilePath,
      name: "file",
      formData: { userId: String(userId || "") },
      timeout: REQUEST_TIMEOUT_MS,
      success: (uploadRes) => {
        const sc = uploadRes.statusCode;
        if (sc === undefined || sc < 200 || sc >= 300) {
          reject(new Error(`HTTP ${sc ?? ""}`));
          return;
        }
        const body = parseResponseData(uploadRes.data as unknown);
        const codeNum = body.code != null ? Number(body.code) : NaN;
        if (codeNum !== 2000) {
          reject(new Error((body.message && String(body.message)) || "图片上传失败"));
          return;
        }
        const outer = body.data as { url?: string } | undefined;
        const url = outer?.url;
        if (!url) {
          reject(new Error("上传成功但未返回地址"));
          return;
        }
        resolve({ ...(typeof outer === "object" && outer ? outer : {}), url: String(url).trim() });
      },
      fail: (err) => reject(new Error((err?.errMsg as string) || "图片上传失败")),
    });
  });
}
