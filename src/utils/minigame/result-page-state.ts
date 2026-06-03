/** zhiwo pages/result onShow → 当前页数据结构 */
import { minigameApp } from "@/state/minigame-app";
import { buildDarknessResultPresentation } from "@/data/quiz-darkness-result-tiers";
import { buildCrushResultPresentation } from "@/data/quiz-crush-result-tiers";
import { buildPeachResultPresentation } from "@/data/quiz-peach-result-tiers";
import { buildBirthColorResultPresentation } from "@/data/quiz-birth-color-result-tiers";

import MBTI_LIST from "@/data/mbti-types";

interface MbtiRich {
  type: string;
  alias?: string;
  keywords?: string[];
  summary?: string;
  strengths?: string;
  fit?: string;
}

export interface DimRowView {
  grad: string;
  splitPercent: number;
  leftCaption: string;
  rightCaption: string;
}

export interface ResultCardView {
  typeCode: string;
  alias: string;
  keywords: string[];
  summary: string;
  strengths: string;
  fit: string;
  showDimension: boolean;
  dimRows: DimRowView[];
}

function getTypeMeta(code: string): MbtiRich | null {
  const list = MBTI_LIST as MbtiRich[];
  for (let i = 0; i < list.length; i += 1) {
    if (list[i]?.type === code) return list[i];
  }
  return null;
}

function getDimensionRows(counts: Record<string, number>): DimRowView[] {
  const c = counts;
  const defs = [
    {
      lk: "I",
      rk: "E",
      grad: "linear-gradient(90deg, #d8243f 0%, #3d62b6 100%)",
      lb: "I内向",
      rb: "E外向",
    },
    {
      lk: "S",
      rk: "N",
      grad: "linear-gradient(90deg, #7b39b2 0%, #efb076 100%)",
      lb: "S实感",
      rb: "N直觉",
    },
    {
      lk: "T",
      rk: "F",
      grad: "linear-gradient(90deg, #f5bb13 0%, #1480d8 100%)",
      lb: "T思维",
      rb: "F情感",
    },
    {
      lk: "J",
      rk: "P",
      grad: "linear-gradient(90deg, #2a9e9a 0%, #d06d10 100%)",
      lb: "J判断",
      rb: "P知觉",
    },
  ];
  return defs.map((d) => {
    const lv = c[d.lk] ?? 0;
    const rv = c[d.rk] ?? 0;
    const t = Math.max(lv + rv, 1);
    const lp = Math.round((lv / t) * 100);
    const rp = Math.round((rv / t) * 100);
    return {
      grad: d.grad,
      splitPercent: lp,
      leftCaption: `${d.lb} ${lp}%`,
      rightCaption: `${rp}% ${d.rb}`,
    };
  });
}

export interface ResultPageState {
  pageTitle: string;
  mode: "self" | "mutual";
  card: ResultCardView;
  sectionTitles: {
    summary: string;
    strengths: string;
    fit: string;
  };
  /** 趣味测评档位名较长时，主标题字号略小 */
  compactTypeHead?: boolean;
}

const DEFAULT_SECTION_TITLES = {
  summary: "类型简介",
  strengths: "性格优势",
  fit: "适合方向",
} as const;

const DARKNESS_SECTION_TITLES = {
  summary: "档位说明",
  strengths: "内心独白",
  fit: "小提示",
} as const;

function buildScoredTierResultPageState(
  pageTitle: string,
  mode: "self" | "mutual",
  view: {
    typeCode: string;
    alias: string;
    keywords: string[];
    summary: string;
    strengths: string;
    fit: string;
  },
): ResultPageState {
  return {
    pageTitle,
    mode,
    sectionTitles: { ...DARKNESS_SECTION_TITLES },
    compactTypeHead: true,
    card: {
      typeCode: view.typeCode,
      alias: view.alias,
      keywords: view.keywords,
      summary: view.summary,
      strengths: view.strengths,
      fit: view.fit,
      showDimension: false,
      dimRows: [],
    },
  };
}

export function buildResultPageState(): ResultPageState {
  const result = minigameApp.currentResult || {};
  const ctx = minigameApp.lastQuizContext || {
    mode: "self" as const,
    inviteId: "",
    quizId: "mbti" as const,
  };
  const mode = ctx.mode === "mutual" ? "mutual" : "self";
  const quizId = typeof ctx.quizId === "string" ? ctx.quizId : "mbti";

  if (quizId === "birth_color") {
    const view = buildBirthColorResultPresentation(result);
    return buildScoredTierResultPageState(
      mode === "mutual" ? "互测已完成" : "本命色彩 · 测试结果",
      mode,
      view,
    );
  }

  if (quizId === "crush_index") {
    const view = buildCrushResultPresentation(result);
    return buildScoredTierResultPageState(
      mode === "mutual" ? "互测已完成" : "花痴指数 · 测试结果",
      mode,
      view,
    );
  }

  if (quizId === "peach_blossom") {
    const view = buildPeachResultPresentation(result);
    return buildScoredTierResultPageState(
      mode === "mutual" ? "互测已完成" : "桃花体质 · 测试结果",
      mode,
      view,
    );
  }

  if (quizId === "darkness_trend") {
    const view = buildDarknessResultPresentation(result);
    return buildScoredTierResultPageState(
      mode === "mutual" ? "互测已完成" : "黑化趋势测试结果",
      mode,
      view,
    );
  }

  const type = (typeof result.type === "string" && result.type) || "--";
  const meta =
    getTypeMeta(type === "--" ? "" : type) ||
    ({
      alias: "类型说明",
      keywords: [] as string[],
      summary: "当前结果暂无详细说明。",
      strengths: "请继续完善类型说明内容。",
      fit: "适合方向待补充。",
    } as MbtiRich);
  const counts =
    typeof result.counts === "object" && result.counts !== null
      ? (result.counts as Record<string, number>)
      : {};
  const showDimension = mode === "mutual";
  const keywords = Array.isArray(meta.keywords) ? meta.keywords : [];
  return {
    pageTitle: mode === "mutual" ? "互测已完成" : "测试结果",
    mode,
    sectionTitles: { ...DEFAULT_SECTION_TITLES },
    card: {
      typeCode: type,
      alias: meta.alias || "",
      keywords: keywords.slice(),
      summary: meta.summary || "",
      strengths: meta.strengths || "",
      fit: meta.fit || "",
      showDimension,
      dimRows: showDimension ? getDimensionRows(counts) : [],
    },
  };
}
