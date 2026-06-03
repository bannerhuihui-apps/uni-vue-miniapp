/**
 * 路由 query 解析 — 与小程序/H5 行为对齐，避免因 recordId 类型非 string 导致取不到参数。
 */

export function normalizeRecordIdKey(recordId: string | number | unknown): string {
  if (recordId == null) return "";
  return String(recordId).trim();
}

/** 从页面 onLoad 的 query 上取记录 id（解码、trim） */
export function queryRecordId(query: unknown): string {
  if (!query || typeof query !== "object") return "";
  const raw = (query as Record<string, unknown>).recordId;
  if (raw == null) return "";
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (first == null) return "";
  let s = String(first).trim();
  if (!s) return "";
  try {
    s = decodeURIComponent(s);
  } catch {
    /* 非法序列时保留原始串 */
  }
  return s.trim();
}

/** 读取互测结果缓存（避免因 number/string key 不一致读不到） */
export function readMutualResultsCached(
  cache: Record<string, unknown[]>,
  recordId: string,
): unknown[] | undefined {
  const k = normalizeRecordIdKey(recordId);
  if (!k) return undefined;
  const direct = cache[k];
  if (Array.isArray(direct)) return direct;
  for (const key of Object.keys(cache)) {
    if (normalizeRecordIdKey(key) === k) {
      const v = cache[key];
      if (Array.isArray(v)) return v;
    }
  }
  return undefined;
}
