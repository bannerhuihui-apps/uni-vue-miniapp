/** 本命色彩 · 结果/记录展示用八档文案（与结果说明表一致） */
export interface BirthColorResultTier {
  id: number;
  /** 卡片大字：颜色名 */
  title: string;
  /** 写入 result.type 的完整标签 */
  typeLabel: string;
  /** 气质标题，如「冷静观察者」 */
  tagline: string;
  scoreMin: number;
  scoreMax: number | null;
  riskHint: string;
  keywordTags: string[];
  summary: string;
  innerVoice: string;
  tip: string;
}

export const BIRTH_COLOR_RESULT_TIERS: BirthColorResultTier[] = [
  {
    id: 1,
    title: "冰川银",
    typeLabel: "本命颜色·冰川银",
    tagline: "冷静观察者",
    scoreMin: 10,
    scoreMax: 10,
    riskHint: "10 分",
    keywordTags: ["冷色系"],
    summary: "冷静观察者！如冰川般通透，总能看透事物本质。",
    innerVoice: "看透本质，再出声——这是我的冰川银。",
    tip: "低分冷色不代表冷淡；很多时候是在保护精力与节奏。",
  },
  {
    id: 2,
    title: "深海蓝",
    typeLabel: "本命颜色·深海蓝",
    tagline: "理性规划者",
    scoreMin: 11,
    scoreMax: 15,
    riskHint: "11–15 分",
    keywordTags: ["稳重大海"],
    summary: "理性规划者！像稳重的海洋，总能把生活安排得井井有条。",
    innerVoice: "先把生活排好序，心就稳了。",
    tip: "规划感是优势；偶尔留白给即兴，也会有意外的轻松。",
  },
  {
    id: 3,
    title: "蜜桃粉",
    typeLabel: "本命颜色·蜜桃粉",
    tagline: "浪漫梦想家",
    scoreMin: 16,
    scoreMax: 20,
    riskHint: "16–20 分",
    keywordTags: ["温柔期待"],
    summary: "浪漫梦想家！如春日桃花，永远对世界抱有温柔期待。",
    innerVoice: "对世界保留一点温柔期待，没什么不好。",
    tip: "浪漫与务实可以并存；把期待写小一点，更容易被满足。",
  },
  {
    id: 4,
    title: "薄荷绿",
    typeLabel: "本命颜色·薄荷绿",
    tagline: "治愈系伙伴",
    scoreMin: 21,
    scoreMax: 25,
    riskHint: "21–25 分",
    keywordTags: ["松弛陪伴"],
    summary: "治愈系伙伴！似林间清风，给人恰到好处的松弛感。",
    innerVoice: "不抢戏，也不缺席——刚刚好就行。",
    tip: "你的松弛感是礼物；也记得给自己留一份。",
  },
  {
    id: 5,
    title: "琥珀黄",
    typeLabel: "本命颜色·琥珀黄",
    tagline: "活力能量源",
    scoreMin: 26,
    scoreMax: 30,
    riskHint: "26–30 分",
    keywordTags: ["冬日暖阳"],
    summary: "活力能量源！像冬日暖阳，走到哪里都能带动气氛。",
    innerVoice: "走到哪儿，就把哪儿点亮一点。",
    tip: "热闹和独处可以并存；记得给身体与情绪留休息位。",
  },
  {
    id: 6,
    title: "薄雾紫",
    typeLabel: "本命颜色·薄雾紫",
    tagline: "神秘艺术家",
    scoreMin: 31,
    scoreMax: 35,
    riskHint: "31–35 分",
    keywordTags: ["创意灵感"],
    summary: "神秘艺术家！若晨曦薄雾，藏着不为人知的创意灵感。",
    innerVoice: "灵感藏在薄雾里，等一个合适的时刻。",
    tip: "神秘不等于难懂；偶尔把想法说出来，更容易被看见。",
  },
  {
    id: 7,
    title: "火焰红",
    typeLabel: "本命颜色·火焰红",
    tagline: "热烈行动派",
    scoreMin: 36,
    scoreMax: 39,
    riskHint: "36–39 分",
    keywordTags: ["改变勇气"],
    summary: "热烈行动派！如跃动火焰，永远充满改变的勇气。",
    innerVoice: "想改就改，火焰不会等人。",
    tip: "冲劲很宝贵；重大决定前也可以多睡一晚再行动。",
  },
  {
    id: 8,
    title: "星空黑",
    typeLabel: "本命颜色·星空黑",
    tagline: "自由探索家",
    scoreMin: 40,
    scoreMax: 40,
    riskHint: "40 分顶配",
    keywordTags: ["未知探索"],
    summary: "自由探索家！像深邃夜空，永远在追寻未知的可能。",
    innerVoice: "夜空再大，也装得下我的好奇心。",
    tip: "满分是顶配梗；真实的你比任何颜色标签都复杂。",
  },
];

const LEGACY_BIRTH_COLOR_TYPE_TIER: Record<string, number> = {
  "本命颜色·未定档": 1,
};

export function formatBirthColorScoreRangeLabel(tier: BirthColorResultTier): string {
  if (tier.scoreMax == null) return `色彩分值 > ${tier.scoreMin - 1}`;
  if (tier.scoreMin === tier.scoreMax) return `色彩分值 ${tier.scoreMin} 分`;
  return `色彩分值 ${tier.scoreMin}–${tier.scoreMax} 分`;
}

export function resolveBirthColorResultTier(score: number): BirthColorResultTier {
  const s = Number.isFinite(score) ? Math.max(0, Math.round(score)) : 0;
  for (let i = 0; i < BIRTH_COLOR_RESULT_TIERS.length; i += 1) {
    const t = BIRTH_COLOR_RESULT_TIERS[i]!;
    if (t.scoreMax == null) {
      if (s >= t.scoreMin) return t;
    } else if (s >= t.scoreMin && s <= t.scoreMax) {
      return t;
    }
  }
  return BIRTH_COLOR_RESULT_TIERS[0]!;
}

export function readBirthColorScore(result: unknown): number | null {
  if (!result || typeof result !== "object") return null;
  const raw = (result as { counts?: Record<string, number> }).counts?.["颜色分值"];
  return typeof raw === "number" ? raw : null;
}

export function resolveBirthColorResultTierFromResult(result: unknown): BirthColorResultTier {
  const score = readBirthColorScore(result);
  if (score != null) return resolveBirthColorResultTier(score);
  if (result && typeof result === "object") {
    const type = String((result as { type?: string }).type || "").trim();
    const legacyId = LEGACY_BIRTH_COLOR_TYPE_TIER[type];
    if (legacyId) {
      return BIRTH_COLOR_RESULT_TIERS.find((t) => t.id === legacyId) ?? BIRTH_COLOR_RESULT_TIERS[0]!;
    }
    const byLabel = BIRTH_COLOR_RESULT_TIERS.find(
      (t) => t.typeLabel === type || type.includes(t.title),
    );
    if (byLabel) return byLabel;
  }
  return BIRTH_COLOR_RESULT_TIERS[0]!;
}

export interface BirthColorResultPresentation {
  typeCode: string;
  alias: string;
  keywords: string[];
  summary: string;
  strengths: string;
  fit: string;
  typeLabel: string;
  score: number;
}

export function buildBirthColorResultPresentation(result: unknown): BirthColorResultPresentation {
  const score = readBirthColorScore(result) ?? 0;
  const tier = resolveBirthColorResultTierFromResult(result);
  const keywords = [tier.riskHint, tier.tagline, ...tier.keywordTags].filter(Boolean).slice(0, 3);
  return {
    typeCode: tier.title,
    alias: `色彩分 ${score} 点`,
    keywords,
    summary: tier.summary,
    strengths: tier.innerVoice,
    fit: tier.tip,
    typeLabel: tier.typeLabel,
    score,
  };
}
