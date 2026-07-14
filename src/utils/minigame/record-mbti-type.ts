/**
 * 从互测/自测记录解析合法的 MBTI 四字母类型。
 * 独立文件，避免 record-result-display ↔ mutual-aggregate 循环依赖。
 */
import { buildMbtiType } from "@/utils/minigame/mbti";

export function getRecordMbtiType(rec: unknown): string {
  if (!rec || typeof rec !== "object") return "";
  const r = rec as { result?: { type?: string }; answers?: string[] };
  const raw = (r.result && r.result.type) || "";
  const t = String(raw).trim().toUpperCase();
  if (t && /^[IE][SN][TF][JP]$/.test(t)) return t;
  const answers = r.answers;
  if (Array.isArray(answers) && answers.length) {
    const computed = buildMbtiType(answers);
    const ct = (computed && computed.type) || "";
    if (ct && /^[IE][SN][TF][JP]$/.test(ct)) return ct;
  }
  return "";
}
