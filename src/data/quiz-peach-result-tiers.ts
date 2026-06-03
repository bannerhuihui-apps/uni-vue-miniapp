/** 桃花体质 · 结果/记录展示用四档文案（与结果说明表一致） */
export interface PeachResultTier {
  id: number;
  title: string;
  typeLabel: string;
  scoreMin: number;
  scoreMax: number | null;
  riskHint: string;
  keywordTags: string[];
  summary: string;
  innerVoice: string;
  tip: string;
}

export const PEACH_RESULT_TIERS: PeachResultTier[] = [
  {
    id: 1,
    title: "潜力桃花体质",
    typeLabel: "桃花体质·潜力桃花体质",
    scoreMin: 10,
    scoreMax: 19,
    riskHint: "10–19 分",
    keywordTags: ["内敛待激发"],
    summary:
      "潜力桃花体质！桃花特质需要特定条件才能激发。比较内敛，但深入了解后会发现你独特的魅力。",
    innerVoice: "我自静待，等那花儿为我而开。",
    tip: "不必为「桃花运」苛求自己；真实的自己都值得被善待。",
  },
  {
    id: 2,
    title: "被动桃花体质",
    typeLabel: "桃花体质·被动桃花体质",
    scoreMin: 20,
    scoreMax: 24,
    riskHint: "20–24 分",
    keywordTags: ["魅力吸引型"],
    summary:
      "被动桃花体质！魅力会自动吸引他人，但在主动追求方面比较保守。朋友们可能经常想帮你牵线搭桥哦！",
    innerVoice: "不期待，不等候，不追求，不主动。",
    tip: "想扩大舒适圈可以用小步走：先有固定兴趣圈活动，再在熟悉面孔里练习表达。",
  },
  {
    id: 3,
    title: "均衡桃花体质",
    typeLabel: "桃花体质·均衡桃花体质",
    scoreMin: 25,
    scoreMax: 29,
    riskHint: "25–29 分",
    keywordTags: ["自然平衡型"],
    summary:
      "均衡桃花体质！桃花运势很平衡，既有自然吸引力，也懂得适时主动。能在不同情境下灵活应对，恋爱智慧令人羡慕。",
    innerVoice: "看感觉，看机缘，有耐心，有智慧。",
    tip: "合拍的关系往往出在互相尊重与舒适感上，远大于任何趣味分数。",
  },
  {
    id: 4,
    title: "主动桃花体质",
    typeLabel: "桃花体质·主动桃花体质",
    scoreMin: 30,
    scoreMax: 40,
    riskHint: "30–40 分",
    keywordTags: ["恋爱高手"],
    summary:
      "主动桃花体质！主动创造机会的恋爱高手！善于展现魅力，积极主动，很懂得把握感情机会，是个行动派。",
    innerVoice: "桃花，桃花，我来了，我来解救你们了。",
    tip: "热闹和独处可以并存；记得给身体与情绪留休息位。",
  },
];

const LEGACY_PEACH_TYPE_TIER: Record<string, number> = {
  "桃花体质·含苞待放": 1,
  "桃花体质·春风拂面": 2,
  "桃花体质·花影摇曳": 3,
  "桃花体质·满园春意": 4,
  "桃花体质·未定档": 1,
};

export function formatPeachScoreRangeLabel(tier: PeachResultTier): string {
  if (tier.scoreMax == null) return `桃花分值 > ${tier.scoreMin - 1}`;
  if (tier.scoreMin === tier.scoreMax) return `桃花分值 ${tier.scoreMin} 分`;
  return `桃花分值 ${tier.scoreMin}–${tier.scoreMax} 分`;
}

export function resolvePeachResultTier(score: number): PeachResultTier {
  const s = Number.isFinite(score) ? Math.max(0, Math.round(score)) : 0;
  for (let i = 0; i < PEACH_RESULT_TIERS.length; i += 1) {
    const t = PEACH_RESULT_TIERS[i]!;
    if (t.scoreMax == null) {
      if (s >= t.scoreMin) return t;
    } else if (s >= t.scoreMin && s <= t.scoreMax) {
      return t;
    }
  }
  return PEACH_RESULT_TIERS[0]!;
}

export function readPeachScore(result: unknown): number | null {
  if (!result || typeof result !== "object") return null;
  const raw = (result as { counts?: Record<string, number> }).counts?.["桃花分值"];
  return typeof raw === "number" ? raw : null;
}

export function resolvePeachResultTierFromResult(result: unknown): PeachResultTier {
  const score = readPeachScore(result);
  if (score != null) return resolvePeachResultTier(score);
  if (result && typeof result === "object") {
    const type = String((result as { type?: string }).type || "").trim();
    const legacyId = LEGACY_PEACH_TYPE_TIER[type];
    if (legacyId) {
      return PEACH_RESULT_TIERS.find((t) => t.id === legacyId) ?? PEACH_RESULT_TIERS[0]!;
    }
    const byLabel = PEACH_RESULT_TIERS.find(
      (t) => t.typeLabel === type || type.includes(t.title),
    );
    if (byLabel) return byLabel;
  }
  return PEACH_RESULT_TIERS[0]!;
}

export interface PeachResultPresentation {
  typeCode: string;
  alias: string;
  keywords: string[];
  summary: string;
  strengths: string;
  fit: string;
  typeLabel: string;
  score: number;
}

export function buildPeachResultPresentation(result: unknown): PeachResultPresentation {
  const score = readPeachScore(result) ?? 0;
  const tier = resolvePeachResultTierFromResult(result);
  const keywords = [tier.riskHint, ...tier.keywordTags].filter(Boolean).slice(0, 3);
  return {
    typeCode: tier.title,
    alias: `桃花分 ${score} 点`,
    keywords,
    summary: tier.summary,
    strengths: tier.innerVoice,
    fit: tier.tip,
    typeLabel: tier.typeLabel,
    score,
  };
}
