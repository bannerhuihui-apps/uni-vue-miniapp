/**
 * zhiwo/utils/mutual-aggregate.js — 「朋友们眼中的你」汇总统计
 */
import MBTI_LIST from "@/data/mbti-types";
import type { SessionQuizId } from "@/state/minigame-app";
import { buildMbtiType } from "@/utils/minigame/mbti";
import { getRecordMbtiType } from "@/utils/minigame/record-mbti-type";
import { buildScoredSummaryFields } from "@/utils/minigame/mutual-scored-aggregate";
import type {
  DimRowVm,
  MutualSummaryVm,
  PillCellVm,
  QuadCellVm,
} from "@/utils/minigame/mutual-summary-types";

export { getRecordMbtiType } from "@/utils/minigame/record-mbti-type";
export type {
  DimRowVm,
  MutualSummaryVm,
  PillCellVm,
  QuadCellVm,
} from "@/utils/minigame/mutual-summary-types";

const LETTER_KEYS = ["E", "I", "S", "N", "T", "F", "J", "P"] as const;

function emptyLetterTotals(): Record<string, number> {
  return { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
}

function addCountsMapToTotals(cm: unknown, totals: Record<string, number>): number {
  if (!cm || typeof cm !== "object" || Array.isArray(cm) || !totals) return 0;
  const obj = cm as Record<string, unknown>;
  let added = 0;
  for (let k = 0; k < LETTER_KEYS.length; k += 1) {
    const key = LETTER_KEYS[k];
    const rawVal = obj[key] != null ? obj[key] : obj[key.toLowerCase()];
    if (rawVal == null) continue;
    const n = typeof rawVal === "number" ? rawVal : parseInt(String(rawVal), 10);
    if (!Number.isNaN(n) && n > 0) {
      totals[key] += n;
      added += n;
    }
  }
  return added;
}

function mergeRecordIntoLetterTotals(rec: unknown, totals: Record<string, number>): void {
  if (!rec || typeof rec !== "object" || !totals) return;
  const r = rec as { result?: { counts?: unknown }; answers?: string[] };
  const res = r.result;
  if (res && res.counts && addCountsMapToTotals(res.counts, totals) > 0) return;

  const answers = r.answers;
  if (Array.isArray(answers) && answers.length) {
    const computed = buildMbtiType(answers);
    if (computed && computed.counts && addCountsMapToTotals(computed.counts, totals) > 0) return;
  }

  const type = getRecordMbtiType(rec);
  for (let j = 0; j < type.length; j += 1) {
    const ch = type[j];
    if (ch && totals[ch] !== undefined) totals[ch] += 1;
  }
}

export function aggregateLetterTotalsFromList(list: unknown[]): Record<string, number> {
  const counts = emptyLetterTotals();
  if (!Array.isArray(list)) return counts;
  for (let i = 0; i < list.length; i += 1) {
    mergeRecordIntoLetterTotals(list[i], counts);
  }
  return counts;
}

export function buildFriendSummaryCompositeParts(list: unknown[]): {
  parts: { text: string; disputed: boolean }[];
  resolvedType: string;
  showTfControversyHint: boolean;
} {
  const counts = aggregateLetterTotalsFromList(list);
  const sum =
    counts.I + counts.E + counts.S + counts.N + counts.T + counts.F + counts.J + counts.P;
  if (sum === 0) {
    return { parts: [], resolvedType: "", showTfControversyHint: false };
  }
  const i = counts.I >= counts.E ? "I" : "E";
  const sn = counts.S >= counts.N ? "S" : "N";
  const tf = counts.T >= counts.F ? "T" : "F";
  const jp = counts.J >= counts.P ? "J" : "P";
  const resolvedType = `${i}${sn}${tf}${jp}`;
  const tCount = counts.T || 0;
  const fCount = counts.F || 0;
  const tfTie = tCount === fCount && tCount + fCount > 0;
  const parts = tfTie
    ? [
        { text: i, disputed: false },
        { text: sn, disputed: false },
        { text: "?", disputed: true },
        { text: jp, disputed: false },
      ]
    : resolvedType.split("").map((ch) => ({ text: ch, disputed: false }));
  return { parts, resolvedType, showTfControversyHint: tfTie };
}

export function topRawTypes(list: unknown[], limit: number): string[] {
  const freq: Record<string, number> = {};
  for (let i = 0; i < list.length; i += 1) {
    const t = getRecordMbtiType(list[i]);
    if (t) freq[t] = (freq[t] || 0) + 1;
  }
  const entries = Object.keys(freq).map((type) => ({ type, n: freq[type] as number }));
  entries.sort((a, b) => b.n - a.n || a.type.localeCompare(b.type));
  return entries.slice(0, limit).map((e) => e.type);
}

export function buildAggregateCounts(list: unknown[]): {
  leftLabel: string;
  leftCount: number;
  rightLabel: string;
  rightCount: number;
}[] {
  const counts = aggregateLetterTotalsFromList(list);
  const rows: [string, string, string, string][] = [
    ["I内向", "I", "E外向", "E"],
    ["S实感", "S", "N直觉", "N"],
    ["T思维", "T", "F情感", "F"],
    ["J判断", "J", "P知觉", "P"],
  ];
  return rows.map(([leftLabel, leftKey, rightLabel, rightKey]) => ({
    leftLabel,
    leftCount: counts[leftKey] || 0,
    rightLabel,
    rightCount: counts[rightKey] || 0,
  }));
}

export function buildDimRows(list: unknown[]): DimRowVm[] {
  const rows: [string, string, string, string, [string, string]][] = [
    ["I内向", "I", "E外向", "E", ["#d8243f", "#3d62b6"]],
    ["S实感", "S", "N直觉", "N", ["#7b39b2", "#efb076"]],
    ["T思维", "T", "F情感", "F", ["#f5bb13", "#1480d8"]],
    ["J判断", "J", "P知觉", "P", ["#2a9e9a", "#d06d10"]],
  ];
  const counts = aggregateLetterTotalsFromList(list);
  return rows.map(([leftLabel, leftKey, rightLabel, rightKey, colors]) => {
    const total = Math.max((counts[leftKey] || 0) + (counts[rightKey] || 0), 1);
    const c0 = colors[0];
    const c1 = colors[1];
    const lc = counts[leftKey] || 0;
    const rc = counts[rightKey] || 0;
    const splitEven = lc === rc && lc + rc > 0;
    let splitHeavy: DimRowVm["splitHeavy"] = "even";
    if (!splitEven) {
      if (lc > rc) splitHeavy = "left";
      else if (rc > lc) splitHeavy = "right";
    }
    return {
      leftLabel,
      rightLabel,
      leftPercent: Math.round((lc / total) * 100),
      rightPercent: Math.round((rc / total) * 100),
      splitHeavy,
      grad: `linear-gradient(90deg, ${c0}, ${c1})`,
    };
  });
}

/** 固定 4 枚胶囊 2×2 */
export function buildPillPairs(pillRows: ReturnType<typeof buildAggregateCounts>): PillCellVm[][] {
  const defaults = [
    { leftLabel: "I内向", leftCount: 0, rightLabel: "E外向", rightCount: 0 },
    { leftLabel: "S实感", leftCount: 0, rightLabel: "N直觉", rightCount: 0 },
    { leftLabel: "T思维", leftCount: 0, rightLabel: "F情感", rightCount: 0 },
    { leftLabel: "J判断", leftCount: 0, rightLabel: "P知觉", rightCount: 0 },
  ];
  const p = Array.isArray(pillRows) ? pillRows.slice(0, 4) : [];
  for (let i = 0; i < 4; i += 1) {
    if (!p[i]) p[i] = { ...defaults[i] };
  }
  const tones = ["pill-mint", "pill-lemon", "pill-mint", "pill-lemon"];
  const four = p.map((row, i) => ({
    leftLabel: row.leftLabel,
    leftCount: row.leftCount,
    rightLabel: row.rightLabel,
    rightCount: row.rightCount,
    pillTone: tones[i],
  }));
  return [four.slice(0, 2), four.slice(2, 4)];
}

interface MbtiRich {
  type: string;
  alias?: string;
}

function getTypeMeta(composite: string): MbtiRich | null {
  if (!composite) return null;
  const arr = MBTI_LIST as MbtiRich[];
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i]?.type === composite) return arr[i];
  }
  return null;
}

function emptyMbtiSummary(): MutualSummaryVm {
  const zeroPills = buildAggregateCounts([]);
  return {
    quizId: "mbti",
    isScoredQuiz: false,
    scoredHeadline: "",
    hasSummaryData: false,
    composite: "",
    compositeParts: [],
    showTfControversyHint: false,
    aliasTop: "",
    topTypesText: "",
    showTopTypes: false,
    pillRows: [],
    pillPairs: buildPillPairs(zeroPills),
    quadGrid: [],
    dimRows: [],
    totalFriends: 0,
    quadBlockTitle: "朋友结果汇总",
    quadBlockSub: "四维度选择次数",
  };
}

export function buildSummaryFields(list: unknown[]): MutualSummaryVm {
  if (!list.length) {
    return emptyMbtiSummary();
  }
  const compositeExtras = buildFriendSummaryCompositeParts(list);
  const composite = compositeExtras.resolvedType;
  const compositeParts = compositeExtras.parts;
  const showTfControversyHint = compositeExtras.showTfControversyHint;
  const meta = composite && !showTfControversyHint ? getTypeMeta(composite) : null;
  const aliasTop = (meta && meta.alias) || "";
  const tops = topRawTypes(list, 3);
  const topTypesText = tops.length ? `好友测评中最常出现的类型：${tops.join("、")}` : "";
  const pillRows = buildAggregateCounts(list);
  return {
    quizId: "mbti",
    isScoredQuiz: false,
    scoredHeadline: "",
    hasSummaryData: true,
    composite,
    compositeParts,
    showTfControversyHint,
    aliasTop,
    topTypesText,
    showTopTypes: tops.length > 0,
    pillRows,
    pillPairs: buildPillPairs(pillRows),
    quadGrid: [],
    dimRows: buildDimRows(list),
    totalFriends: list.length,
    quadBlockTitle: "朋友结果汇总",
    quadBlockSub: "四维度选择次数",
  };
}

/** 按套题生成汇总：MBTI 走四字母合成，趣味测评走档位 + A/B/C/D 四象 */
export function buildSummaryFieldsForQuiz(list: unknown[], quizId: SessionQuizId): MutualSummaryVm {
  if (quizId !== "mbti") {
    return buildScoredSummaryFields(list, quizId);
  }
  return buildSummaryFields(list);
}
