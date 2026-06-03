/**
 * 趣味测评互测汇总：档位频次 + 答题 A/B/C/D 四象分布
 */
import { getIndexHubCarouselLabel } from "@/data/index-hub-carousel";
import type { SessionQuizId } from "@/state/minigame-app";
import {
  buildRecordResultPresentation,
  type RecordResultPresentation,
} from "@/utils/minigame/record-result-display";
import type { DimRowVm, MutualSummaryVm, PillCellVm, QuadCellVm } from "@/utils/minigame/mutual-aggregate";

type ScoredQuizId = Exclude<SessionQuizId, "mbti">;

/** 四象图左右轴文案（与每题 A/B/C/D 倾向一致） */
const SCORED_QUAD_AXIS: Record<
  ScoredQuizId,
  { ab: [string, string]; cd: [string, string] }
> = {
  darkness_trend: {
    ab: ["A 温和", "B 克制"],
    cd: ["C 暗涌", "D 黑化"],
  },
  peach_blossom: {
    ab: ["A 寡淡", "B 慢热"],
    cd: ["C 旺桃花", "D 桃花运"],
  },
  crush_index: {
    ab: ["A 理性", "B 心动"],
    cd: ["C 花痴", "D 恋爱脑"],
  },
  birth_color: {
    ab: ["A 暖色", "B 亮色"],
    cd: ["C 冷色", "D 暗色"],
  },
};

function emptyAbcd(): Record<"A" | "B" | "C" | "D", number> {
  return { A: 0, B: 0, C: 0, D: 0 };
}

function normalizeAnswerLetter(raw: unknown): "" | "A" | "B" | "C" | "D" {
  const s = String(raw ?? "")
    .trim()
    .toUpperCase();
  if (s === "A" || s === "B" || s === "C" || s === "D") return s;
  return "";
}

/** 汇总好友互测里每道题的 A/B/C/D 选择次数 */
export function aggregateAbcdAnswerCounts(list: unknown[]): Record<"A" | "B" | "C" | "D", number> {
  const counts = emptyAbcd();
  if (!Array.isArray(list)) return counts;
  for (let i = 0; i < list.length; i += 1) {
    const rec = list[i] as { answers?: unknown[] };
    const answers = rec?.answers;
    if (!Array.isArray(answers)) continue;
    for (let j = 0; j < answers.length; j += 1) {
      const letter = normalizeAnswerLetter(answers[j]);
      if (letter) counts[letter] += 1;
    }
  }
  return counts;
}

export function buildScoredQuadGrid(
  quizId: ScoredQuizId,
  counts: Record<"A" | "B" | "C" | "D", number>,
): QuadCellVm[][] {
  const axis = SCORED_QUAD_AXIS[quizId];
  const tones = ["pill-mint", "pill-lemon", "pill-mint", "pill-lemon"];
  return [
    [
      { label: axis.ab[0], count: counts.A, pillTone: tones[0]! },
      { label: axis.ab[1], count: counts.B, pillTone: tones[1]! },
    ],
    [
      { label: axis.cd[0], count: counts.C, pillTone: tones[2]! },
      { label: axis.cd[1], count: counts.D, pillTone: tones[3]! },
    ],
  ];
}

/** 与 MBTI buildPillPairs 同结构：一行两枚胶囊，分别为 A/B、C/D 对比 */
export function buildScoredPillPairs(
  quizId: ScoredQuizId,
  counts: Record<"A" | "B" | "C" | "D", number>,
): PillCellVm[][] {
  const axis = SCORED_QUAD_AXIS[quizId];
  return [
    [
      {
        leftLabel: axis.ab[0],
        leftCount: counts.A,
        rightLabel: axis.ab[1],
        rightCount: counts.B,
        pillTone: "pill-mint",
      },
      {
        leftLabel: axis.cd[0],
        leftCount: counts.C,
        rightLabel: axis.cd[1],
        rightCount: counts.D,
        pillTone: "pill-lemon",
      },
    ],
  ];
}

/** 与 MBTI buildDimRows 同结构：A/B、C/D 两轴百分比条 */
export function buildScoredDimRows(
  quizId: ScoredQuizId,
  counts: Record<"A" | "B" | "C" | "D", number>,
): DimRowVm[] {
  const axis = SCORED_QUAD_AXIS[quizId];
  const rows: [string, "A" | "B" | "C" | "D", string, "A" | "B" | "C" | "D", [string, string]][] = [
    [axis.ab[0], "A", axis.ab[1], "B", ["#d8243f", "#3d62b6"]],
    [axis.cd[0], "C", axis.cd[1], "D", ["#7b39b2", "#efb076"]],
  ];
  return rows.map(([leftLabel, leftKey, rightLabel, rightKey, colors]) => {
    const lc = counts[leftKey] || 0;
    const rc = counts[rightKey] || 0;
    const total = Math.max(lc + rc, 1);
    const splitEven = lc === rc && lc + rc > 0;
    let splitHeavy: DimRowVm["splitHeavy"] = "even";
    if (!splitEven) {
      if (lc > rc) splitHeavy = "left";
      else if (rc > lc) splitHeavy = "right";
    }
    const [c0, c1] = colors;
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

function topTierCodes(list: unknown[], limit: number): string[] {
  const freq: Record<string, number> = {};
  for (let i = 0; i < list.length; i += 1) {
    const pres = buildRecordResultPresentation(list[i]);
    const code = pres.typeCode;
    if (!code || code === "--") continue;
    freq[code] = (freq[code] || 0) + 1;
  }
  return Object.keys(freq)
    .map((type) => ({ type, n: freq[type] as number }))
    .sort((a, b) => b.n - a.n || a.type.localeCompare(b.type))
    .slice(0, limit)
    .map((e) => e.type);
}

function resolveHeadlineTier(list: unknown[]): RecordResultPresentation | null {
  const tops = topTierCodes(list, 1);
  if (!tops.length) return null;
  const target = tops[0]!;
  for (let i = 0; i < list.length; i += 1) {
    const pres = buildRecordResultPresentation(list[i]);
    if (pres.typeCode === target) return pres;
  }
  return { quizId: "mbti", typeCode: target, alias: "", keywords: [] };
}

function averageScoreAlias(list: unknown[], quizId: ScoredQuizId): string {
  let sum = 0;
  let n = 0;
  for (let i = 0; i < list.length; i += 1) {
    const pres = buildRecordResultPresentation(list[i]);
    if (pres.quizId !== quizId) continue;
    const alias = pres.alias || "";
    const m = alias.match(/(\d+)\s*点/);
    if (m) {
      sum += Number(m[1]);
      n += 1;
    }
  }
  if (!n) return "";
  const avg = Math.round(sum / n);
  const scoreKey =
    quizId === "darkness_trend"
      ? "黑化"
      : quizId === "peach_blossom"
        ? "桃花"
        : quizId === "crush_index"
          ? "花痴"
          : "颜色";
  return `好友平均 ${scoreKey} ${avg} 点`;
}

function emptyScoredSummary(quizId: ScoredQuizId): MutualSummaryVm {
  return {
    quizId,
    isScoredQuiz: true,
    hasSummaryData: false,
    scoredHeadline: "",
    composite: "",
    compositeParts: [],
    showTfControversyHint: false,
    aliasTop: "",
    topTypesText: "",
    showTopTypes: false,
    pillRows: [],
    pillPairs: buildScoredPillPairs(quizId, emptyAbcd()),
    quadGrid: buildScoredQuadGrid(quizId, emptyAbcd()),
    dimRows: buildScoredDimRows(quizId, emptyAbcd()),
    totalFriends: 0,
    quadBlockTitle: "朋友结果汇总",
    quadBlockSub: "四象选择次数",
  };
}

export function buildScoredSummaryFields(list: unknown[], quizId: ScoredQuizId): MutualSummaryVm {
  if (!list.length) return emptyScoredSummary(quizId);

  const abcd = aggregateAbcdAnswerCounts(list);
  const tops = topTierCodes(list, 3);
  const headline = resolveHeadlineTier(list);
  const label = getIndexHubCarouselLabel(quizId);

  return {
    quizId,
    isScoredQuiz: true,
    hasSummaryData: true,
    scoredHeadline: headline?.typeCode || "",
    composite: headline?.typeCode || "",
    compositeParts: headline?.typeCode ? [{ text: headline.typeCode, disputed: false }] : [],
    showTfControversyHint: false,
    aliasTop: averageScoreAlias(list, quizId) || headline?.alias || "",
    topTypesText: tops.length ? `好友测评中最常出现的${label}档位：${tops.join("、")}` : "",
    showTopTypes: tops.length > 0,
    pillRows: [],
    pillPairs: buildScoredPillPairs(quizId, abcd),
    quadGrid: buildScoredQuadGrid(quizId, abcd),
    dimRows: buildScoredDimRows(quizId, abcd),
    totalFriends: list.length,
    quadBlockTitle: "朋友结果汇总",
    quadBlockSub: "四象选择次数",
  };
}

/** 只保留指定套题的互测记录 */
export function filterMutualListByQuizId(list: unknown[], quizId: SessionQuizId): unknown[] {
  if (!Array.isArray(list)) return [];
  return list.filter((item) => buildRecordResultPresentation(item).quizId === quizId);
}
