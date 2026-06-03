/** zhiwo/utils/app-env.js */

export function getAppId(): string {
  try {
    const u = uni as { getAccountInfoSync?: () => undefined | { miniProgram?: { appId?: string } } };
    const info = u.getAccountInfoSync?.();
    return (info?.miniProgram?.appId as string | undefined) || "";
  } catch {
    return "";
  }
}
