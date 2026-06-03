/** 花痴指数 · 结果/记录展示用五档文案（与结果说明表一致） */
export interface CrushResultTier {
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

export const CRUSH_RESULT_TIERS: CrushResultTier[] = [
  {
    id: 1,
    title: "花痴绝缘圣体",
    typeLabel: "花痴指数·花痴绝缘圣体",
    scoreMin: 0,
    scoreMax: 5,
    riskHint: "0–5 分",
    keywordTags: ["绝缘圣体"],
    summary:
      "花痴绝缘圣体！不可能，绝对不可能。大师，您还是回山上去吧，这俗世不适合您啊。",
    innerVoice: "阿门无量个陀佛。",
    tip: "低分不代表无趣；可能只是你把注意力给了游戏、工作或别的热爱领域。",
  },
  {
    id: 2,
    title: "轻度花痴",
    typeLabel: "花痴指数·轻度花痴",
    scoreMin: 6,
    scoreMax: 15,
    riskHint: "6–15 分",
    keywordTags: ["理性欣赏派"],
    summary: "轻度花痴！理性欣赏派，清醒旁观者，偶尔关注花界，但不会熬夜打榜，生活主次分明。",
    innerVoice: "嗯，有点那么点意思。",
    tip: "偶尔欣赏很正常；保持作息与花销在自己舒服的范围里就好。",
  },
  {
    id: 3,
    title: "中度花痴",
    typeLabel: "花痴指数·中度花痴",
    scoreMin: 16,
    scoreMax: 25,
    riskHint: "16–25 分",
    keywordTags: ["热情行动派"],
    summary: "中度花痴！热情行动派，会为偶像花钱花时间，但能控制尺度，不会影响正常生活。",
    innerVoice: "XXX，我爱你，就像老鼠爱大米。",
    tip: "为热爱投入本身很正常；记得和钱包、作息保持平衡。",
  },
  {
    id: 4,
    title: "重度花痴",
    typeLabel: "花痴指数·重度花痴",
    scoreMin: 26,
    scoreMax: 29,
    riskHint: "26–29 分",
    keywordTags: ["为爱发电"],
    summary:
      "重度花痴！「为爱发电」永动机！偶像相关的事永远排第一，愿意为 TA 学习新技能甚至改变生活习惯。",
    innerVoice: "没你，我可怎么活？",
    tip: "若结果偏高，把它当作「这一周的我」而不是「一辈子的我」，随时可被新的兴趣稀释。",
  },
  {
    id: 5,
    title: "花痴界诺贝尔奖",
    typeLabel: "花痴指数·花痴界诺贝尔奖",
    scoreMin: 30,
    scoreMax: 30,
    riskHint: "30 分顶配",
    keywordTags: ["诺贝尔奖梗"],
    summary: "「花痴界诺贝尔奖」获得者！花痴病，已经基本无药可救了，注意安全，祝好运，祝平安。",
    innerVoice: "我要爱十个！一次，就要爱十个！",
    tip: "顶配玩笑仅供娱乐；不涉及明星真人评价，请遵守公共秩序与他人边界。",
  },
];

const LEGACY_CRUSH_TYPE_TIER: Record<string, number> = {
  "花痴指数·大师您还是回山吧": 1,
  "花痴指数·绝缘体花痴": 1,
  "花痴指数·轻度花痴": 2,
  "花痴指数·中度花痴": 3,
  "花痴指数·重度花痴": 4,
  "花痴指数·诺贝尔奖级": 5,
  "花痴指数·未定档": 1,
};

export function formatCrushScoreRangeLabel(tier: CrushResultTier): string {
  if (tier.scoreMax == null) return `花痴指数 > ${tier.scoreMin - 1}`;
  if (tier.scoreMin === tier.scoreMax) return `花痴指数 ${tier.scoreMin} 分`;
  return `花痴指数 ${tier.scoreMin}–${tier.scoreMax} 分`;
}

export function resolveCrushResultTier(score: number): CrushResultTier {
  const s = Number.isFinite(score) ? Math.max(0, Math.round(score)) : 0;
  for (let i = 0; i < CRUSH_RESULT_TIERS.length; i += 1) {
    const t = CRUSH_RESULT_TIERS[i]!;
    if (t.scoreMax == null) {
      if (s >= t.scoreMin) return t;
    } else if (s >= t.scoreMin && s <= t.scoreMax) {
      return t;
    }
  }
  return CRUSH_RESULT_TIERS[0]!;
}

export function readCrushScore(result: unknown): number | null {
  if (!result || typeof result !== "object") return null;
  const raw = (result as { counts?: Record<string, number> }).counts?.["花痴分值"];
  return typeof raw === "number" ? raw : null;
}

export function resolveCrushResultTierFromResult(result: unknown): CrushResultTier {
  const score = readCrushScore(result);
  if (score != null) return resolveCrushResultTier(score);
  if (result && typeof result === "object") {
    const type = String((result as { type?: string }).type || "").trim();
    const legacyId = LEGACY_CRUSH_TYPE_TIER[type];
    if (legacyId) {
      return CRUSH_RESULT_TIERS.find((t) => t.id === legacyId) ?? CRUSH_RESULT_TIERS[0]!;
    }
    const byLabel = CRUSH_RESULT_TIERS.find(
      (t) => t.typeLabel === type || type.includes(t.title),
    );
    if (byLabel) return byLabel;
  }
  return CRUSH_RESULT_TIERS[0]!;
}

export interface CrushResultPresentation {
  typeCode: string;
  alias: string;
  keywords: string[];
  summary: string;
  strengths: string;
  fit: string;
  typeLabel: string;
  score: number;
}

export function buildCrushResultPresentation(result: unknown): CrushResultPresentation {
  const score = readCrushScore(result) ?? 0;
  const tier = resolveCrushResultTierFromResult(result);
  const keywords = [tier.riskHint, ...tier.keywordTags].filter(Boolean).slice(0, 3);
  return {
    typeCode: tier.title,
    alias: `花痴分 ${score} 点`,
    keywords,
    summary: tier.summary,
    strengths: tier.innerVoice,
    fit: tier.tip,
    typeLabel: tier.typeLabel,
    score,
  };
}
