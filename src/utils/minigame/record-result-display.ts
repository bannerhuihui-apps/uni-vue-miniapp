/** 自测 / 互测记录统一展示字段（列表、互测详情、对比分析共用） */
import MBTI_LIST from "@/data/mbti-types";
import { buildBirthColorResultPresentation } from "@/data/quiz-birth-color-result-tiers";
import { buildCrushResultPresentation } from "@/data/quiz-crush-result-tiers";
import { buildDarknessResultPresentation } from "@/data/quiz-darkness-result-tiers";
import { buildPeachResultPresentation } from "@/data/quiz-peach-result-tiers";
import type { SessionQuizId } from "@/state/minigame-app";
import { getRecordMbtiType } from "@/utils/minigame/mutual-aggregate";
import { resolveRecordQuizId } from "@/utils/minigame/quiz-id";

export interface RecordResultPresentation {
  quizId: SessionQuizId;
  typeCode: string;
  alias: string;
  keywords: string[];
}

function asRecord(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  return raw as Record<string, unknown>;
}

function mbtiMeta(typeCode: string): { alias: string; keywords: string[] } {
  const u = String(typeCode || "").trim().toUpperCase();
  const arr = MBTI_LIST as { type: string; alias?: string; keywords?: string[] }[];
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i]?.type === u) {
      return {
        alias: arr[i].alias || "—",
        keywords: Array.isArray(arr[i].keywords) ? arr[i].keywords!.slice(0, 3) : [],
      };
    }
  }
  return { alias: "—", keywords: [] };
}

function normalizeMbtiCode(raw: string): string {
  const u = String(raw || "").trim().toUpperCase();
  return /^[EI][SN][TF][JP]$/.test(u) ? u : "";
}

/** 任意测试记录 → 卡片大字 / 副标题 / 关键词 */
export function buildRecordResultPresentation(raw: unknown): RecordResultPresentation {
  const rec = asRecord(raw);
  if (!rec) {
    return { quizId: "mbti", typeCode: "--", alias: "—", keywords: [] };
  }

  const quizId = resolveRecordQuizId(rec);
  const result = rec.result;

  if (quizId === "darkness_trend") {
    const view = buildDarknessResultPresentation(result);
    return {
      quizId,
      typeCode: view.typeCode,
      alias: view.alias,
      keywords: view.keywords.slice(0, 3),
    };
  }
  if (quizId === "crush_index") {
    const view = buildCrushResultPresentation(result);
    return {
      quizId,
      typeCode: view.typeCode,
      alias: view.alias,
      keywords: view.keywords.slice(0, 3),
    };
  }
  if (quizId === "peach_blossom") {
    const view = buildPeachResultPresentation(result);
    return {
      quizId,
      typeCode: view.typeCode,
      alias: view.alias,
      keywords: view.keywords.slice(0, 3),
    };
  }
  if (quizId === "birth_color") {
    const view = buildBirthColorResultPresentation(result);
    return {
      quizId,
      typeCode: view.typeCode,
      alias: view.alias,
      keywords: view.keywords.slice(0, 3),
    };
  }

  const mbti = normalizeMbtiCode(getRecordMbtiType(raw)) || normalizeMbtiCode(String((result as { type?: string })?.type || ""));
  const typeCode = mbti || String((result as { type?: string })?.type || "").trim() || "--";
  const meta = mbtiMeta(typeCode);
  return { quizId: "mbti", typeCode, alias: meta.alias, keywords: meta.keywords };
}

export function resolveRawRecordQuizId(raw: unknown): SessionQuizId {
  return resolveRecordQuizId(asRecord(raw) || {});
}

/** 互测行与对应自测是否同一档位 / 同一 MBTI 类型 */
export function mutualResultsMatch(selfRaw: unknown, mutualRaw: unknown): boolean {
  const self = buildRecordResultPresentation(selfRaw);
  const friend = buildRecordResultPresentation(mutualRaw);
  if (self.typeCode === "--" || friend.typeCode === "--") return false;
  if (self.quizId !== friend.quizId) return false;
  if (self.quizId === "mbti") {
    const a = normalizeMbtiCode(self.typeCode);
    const b = normalizeMbtiCode(friend.typeCode);
    return !!(a && b && a === b);
  }
  return self.typeCode === friend.typeCode;
}
