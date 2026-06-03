/**
 * 非 MBTI 测评的「说明」分页文案（答题页底部的说明入口同源）。
 * 每套题独立若干页，用上一页 / 下一页切换，避免误展示 16 型 MBTI 列表。
 */

import type { SessionQuizId } from "@/state/minigame-app";
import {
  DARKNESS_RESULT_TIERS,
  formatDarknessScoreRangeLabel,
} from "@/data/quiz-darkness-result-tiers";
import {
  CRUSH_RESULT_TIERS,
  formatCrushScoreRangeLabel,
} from "@/data/quiz-crush-result-tiers";
import {
  PEACH_RESULT_TIERS,
  formatPeachScoreRangeLabel,
} from "@/data/quiz-peach-result-tiers";

import {
  BIRTH_COLOR_RESULT_TIERS,
  formatBirthColorScoreRangeLabel,
} from "@/data/quiz-birth-color-result-tiers";
import {
  BIRTH_COLOR_INFO_IMAGES,
  CRUSH_INFO_IMAGES,
  DARKNESS_INFO_IMAGES,
  PEACH_INFO_IMAGES,
} from "@/config/static-images";

/** 与 info 页 `mbti-types` 条目字段对齐，便于共用模板 */
export interface QuizInfoSlide {
  type: string;
  alias: string;
  keywords: string[];
  summary: string;
  strengths: string;
  fit: string;
  /** 黑化趋势档位说明图 */
  imageSrc?: string;
  /** 如「黑化值 0–5」 */
  scoreRangeLabel?: string;
  tierSlide?: boolean;
}

type ScoredQuizId = Exclude<SessionQuizId, "mbti">;

export const SCORED_QUIZ_INFO_IDS: ScoredQuizId[] = [
  "darkness_trend",
  "peach_blossom",
  "crush_index",
  "birth_color",
];

/** 黑化趋势：导读 1 页 + 五档分值说明（各配图） */
export const DARKNESS_INFO_PAGES: QuizInfoSlide[] = [
  {
    type: "导读",
    alias: "黑化趋势怎么玩",
    keywords: ["情境趣味题", "10 道题", "0–30 分"],
    summary:
      "「黑化趋势」把日常里的尴尬、憋屈、无语瞬间做成选择题，看看你在题干里更偏向「笑嘻嘻带过」还是「心里已经写好剧本」。",
    strengths:
      "每题四选一（A/B/C/D），选项分值越高，越接近「回击、算账、上头」路线；分值越低，越偏向释怀、佛系或当场沟通。自测用「你的视角」，好友互测用「你认为 TA 会怎么做」。",
    fit: "本测试仅供娱乐，不对人格下定论，不涉及心理疾病或婚恋判断；同一套题不同心情可能选得不一样，这很正常。",
  },
  ...DARKNESS_RESULT_TIERS.map((tier, idx) => ({
    type: formatDarknessScoreRangeLabel(tier),
    alias: tier.title,
    keywords: [tier.riskHint, ...tier.keywordTags].slice(0, 3),
    summary: tier.summary,
    strengths: tier.innerVoice,
    fit: tier.tip,
    imageSrc: DARKNESS_INFO_IMAGES[idx],
    scoreRangeLabel: formatDarknessScoreRangeLabel(tier),
    tierSlide: true,
  })),
];

/** 桃花体质：导读 1 页 + 四档分值说明（各配图） */
export const PEACH_INFO_PAGES: QuizInfoSlide[] = [
  {
    type: "导读",
    alias: "桃花体质怎么玩",
    keywords: ["社交趣味题", "10 道题", "10–40 分"],
    summary:
      "「桃花体质」从聚会、搭讪、存在感等角度出题，看看你更偏「主动出击型」「慢热耐看型」「低调观察型」等趣味标签。",
    strengths:
      "每题四选一（A/B/C/D），选项分值 1–4 分累加；分值越高越接近题干里「人缘活跃、易被关注」的倾向。自测用「你的视角」，好友互测用「你认为 TA 会怎么做」。",
    fit: "结果不含命运预测：现实里的缘分与关系取决于尊重、选择与相处方式，远大于任何趣味分数。",
  },
  ...PEACH_RESULT_TIERS.map((tier, idx) => ({
    type: formatPeachScoreRangeLabel(tier),
    alias: tier.title,
    keywords: [tier.riskHint, ...tier.keywordTags].slice(0, 3),
    summary: tier.summary,
    strengths: tier.innerVoice,
    fit: tier.tip,
    imageSrc: PEACH_INFO_IMAGES[idx],
    scoreRangeLabel: formatPeachScoreRangeLabel(tier),
    tierSlide: true,
  })),
];

/** 花痴指数：导读 1 页 + 五档分值说明（各配图） */
export const CRUSH_INFO_PAGES: QuizInfoSlide[] = [
  {
    type: "导读",
    alias: "花痴指数怎么玩",
    keywords: ["颜值追星梗", "10 道题", "0–30 分"],
    summary:
      "题目围绕「看到好看的人、刷到偶像、存图、线下花钱」等轻松场景，用夸张选项拼出一个 0–30 分的趣味指数。不是诊断，也不评价道德。",
    strengths:
      "计分与题库表一致：A=1 分，B=2 分，C=3 分，D=0 分，10 题累加后落在不同分数段对应不同「花痴体质」玩笑称号。",
    fit: "若某些题让你不适，可直接跳过本套题；娱乐内容应以你舒服为前提。",
  },
  ...CRUSH_RESULT_TIERS.map((tier, idx) => ({
    type: formatCrushScoreRangeLabel(tier),
    alias: tier.title,
    keywords: [tier.riskHint, ...tier.keywordTags].slice(0, 3),
    summary: tier.summary,
    strengths: tier.innerVoice,
    fit: tier.tip,
    imageSrc: CRUSH_INFO_IMAGES[idx],
    scoreRangeLabel: formatCrushScoreRangeLabel(tier),
    tierSlide: true,
  })),
];

/** 本命色彩：导读 1 页 + 八色分值说明（各配图） */
export const BIRTH_COLOR_INFO_PAGES: QuizInfoSlide[] = [
  {
    type: "导读",
    alias: "本命色彩怎么玩",
    keywords: ["色彩气质", "10 道题", "10–40 分"],
    summary:
      "「本命色彩」用生活小选择拼出你的趣味「代表色」——不是玄学算命，而是把偏好与反应方式翻译成冰川银、蜜桃粉、星空黑等娱乐标签。",
    strengths:
      "每题四选一（A/B/C/D），分别计 1/2/3/4 分，10 题相加得到总分；自测用「你的视角」，好友互测用「你认为 TA 会怎么做」。",
    fit: "颜色名称与分数仅供娱乐分享，不代表真实性格诊断或运势预测。",
  },
  ...BIRTH_COLOR_RESULT_TIERS.map((tier, idx) => ({
    type: formatBirthColorScoreRangeLabel(tier),
    alias: tier.title,
    keywords: [tier.riskHint, tier.tagline, ...tier.keywordTags].slice(0, 3),
    summary: tier.summary,
    strengths: tier.innerVoice,
    fit: tier.tip,
    imageSrc: BIRTH_COLOR_INFO_IMAGES[idx],
    scoreRangeLabel: formatBirthColorScoreRangeLabel(tier),
    tierSlide: true,
  })),
];

const QUIZ_INFO_BY_ID: Record<ScoredQuizId, QuizInfoSlide[]> = {
  darkness_trend: DARKNESS_INFO_PAGES,
  peach_blossom: PEACH_INFO_PAGES,
  crush_index: CRUSH_INFO_PAGES,
  birth_color: BIRTH_COLOR_INFO_PAGES,
};

export function isScoredQuizInfoId(id: string): id is ScoredQuizId {
  return (SCORED_QUIZ_INFO_IDS as readonly string[]).includes(id);
}

export function getQuizInfoPages(quizId: ScoredQuizId): QuizInfoSlide[] {
  return QUIZ_INFO_BY_ID[quizId];
}

/** 用于从测验结果档位标题跳到较相关的一页（找不到则 0） */
export function guessQuizInfoSlideIndex(quizId: ScoredQuizId, resultLabel: string): number {
  const pages = getQuizInfoPages(quizId);
  const needle = String(resultLabel || "").trim();
  if (!needle) return 0;
  for (let i = 0; i < pages.length; i++) {
    const slide = pages[i];
    const blob = `${slide.type} ${slide.alias} ${(slide.keywords || []).join(" ")}`;
    if (blob.includes(needle) || needle.includes(slide.alias)) return i;
  }
  /** 粗略关键词兜底 */
  if (quizId === "darkness_trend") {
    for (let i = 0; i < DARKNESS_RESULT_TIERS.length; i += 1) {
      const tier = DARKNESS_RESULT_TIERS[i]!;
      if (
        needle.includes(tier.title) ||
        needle.includes(tier.typeLabel) ||
        needle.includes(formatDarknessScoreRangeLabel(tier))
      ) {
        return i + 1;
      }
    }
    if (/小清新|情绪波动|易燃|冷静期/.test(needle)) return 2;
  }
  if (quizId === "peach_blossom") {
    for (let i = 0; i < PEACH_RESULT_TIERS.length; i += 1) {
      const tier = PEACH_RESULT_TIERS[i]!;
      if (
        needle.includes(tier.title) ||
        needle.includes(tier.typeLabel) ||
        needle.includes(formatPeachScoreRangeLabel(tier))
      ) {
        return i + 1;
      }
    }
    if (/含苞|春风|花影|满园/.test(needle)) return 2;
  }
  if (quizId === "crush_index") {
    for (let i = 0; i < CRUSH_RESULT_TIERS.length; i += 1) {
      const tier = CRUSH_RESULT_TIERS[i]!;
      if (
        needle.includes(tier.title) ||
        needle.includes(tier.typeLabel) ||
        needle.includes(formatCrushScoreRangeLabel(tier))
      ) {
        return i + 1;
      }
    }
    if (/绝缘|轻度|大师|诺贝尔/.test(needle)) return 2;
    if (/中度|重度/.test(needle)) return 3;
  }
  if (quizId === "birth_color") {
    for (let i = 0; i < BIRTH_COLOR_RESULT_TIERS.length; i += 1) {
      const tier = BIRTH_COLOR_RESULT_TIERS[i]!;
      if (
        needle.includes(tier.title) ||
        needle.includes(tier.typeLabel) ||
        needle.includes(tier.tagline) ||
        needle.includes(formatBirthColorScoreRangeLabel(tier))
      ) {
        return i + 1;
      }
    }
    if (/冰川|深海|薄荷/.test(needle)) return 2;
    if (/蜜桃|琥珀|火焰|薄雾|星空/.test(needle)) return 5;
  }
  return 0;
}
