/** zhiwo/utils/avatar-url.js */
export function publicAvatarUrl(url?: string): string {
  const u = (url || "").trim();
  if (!u) return "";
  const low = u.toLowerCase();
  if (low.startsWith("wxfile://")) return "";
  if (low.startsWith("wxlocalresource://")) return "";
  return u;
}
