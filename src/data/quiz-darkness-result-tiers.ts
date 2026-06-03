/** 黑化趋势 · 结果/记录展示用五档文案（与结果说明表一致） */
export interface DarknessResultTier {
  id: number;
  /** 卡片大字：档位名 */
  title: string;
  /** 写入 result.type 的完整标签 */
  typeLabel: string;
  scoreMin: number;
  scoreMax: number | null;
  riskHint: string;
  /** 可选短标签，展示在关键词行 */
  keywordTags: string[];
  summary: string;
  innerVoice: string;
  tip: string;
}

export const DARKNESS_RESULT_TIERS: DarknessResultTier[] = [
  {
    id: 1,
    title: "暖暖的小太阳",
    typeLabel: "黑化趋势·暖暖的小太阳",
    scoreMin: 0,
    scoreMax: 5,
    riskHint: "黑化概率 < 5%",
    keywordTags: ["暖暖系"],
    summary: "绝对暖暖的小太阳！黑化概率 < 5%，但小心，不要被欺负哦～",
    innerVoice: "这世界怎么会有坏人？",
    tip: "保持这份善意很好；若遇到不公平，也可以试着用温和的方式表达边界。",
  },
  {
    id: 2,
    title: "人间四月天",
    typeLabel: "黑化趋势·人间四月天",
    scoreMin: 6,
    scoreMax: 15,
    riskHint: "黑化概率 10%",
    keywordTags: ["冷静理智派"],
    summary: "人间四月天，冷静理智派，黑化概率 10%，偶尔吐槽但不会行动。",
    innerVoice: "看得清，但做不出，自己心里过得去就行。",
    tip: "偶尔吐槽很正常；若积压多了，找信任的人聊两句会更轻松。",
  },
  {
    id: 3,
    title: "轻度黑化",
    typeLabel: "黑化趋势·轻度黑化",
    scoreMin: 16,
    scoreMax: 28,
    riskHint: "轻度黑化",
    keywordTags: ["上头 5 分钟"],
    summary: "轻度黑化倾向！遇到刺激容易「黑化 5 分钟」，建议找朋友倾诉～",
    innerVoice: "惹不起，我还躲不起吗？可别把我逼急了哦。",
    tip: "情绪上来时可以先暂停、走动或写下来，不必立刻给出最终反应。",
  },
  {
    id: 4,
    title: "中度危险",
    typeLabel: "黑化趋势·中度危险",
    scoreMin: 29,
    scoreMax: 36,
    riskHint: "中度危险",
    keywordTags: ["报复心警惕"],
    summary: "中度危险！内心住着小恶魔，需警惕「报复心」升级。",
    innerVoice: "人不犯我，我不犯人，若有人惹我，我让你吃不了兜着走。",
    tip: "高火气不等于坏人；试试睡一觉再回复，或把真实需求用更直接的话说出口。",
  },
  {
    id: 5,
    title: "重度预警",
    typeLabel: "黑化趋势·重度预警",
    scoreMin: 37,
    scoreMax: null,
    riskHint: "重度预警",
    keywordTags: ["甜品救场"],
    summary: "重度预警！建议立刻调整心理状态或狂吃甜品缓解压力！",
    innerVoice: "犯我神威者，虽远必诛！必诛！",
    tip: "结果仅供娱乐；若真实生活长期情绪紧绷，休息、运动或和专业的人聊聊都值得考虑。",
  },
];

/** 旧版四档 type 与分数区间的兜底映射（读历史记录） */
const LEGACY_DARKNESS_TYPE_TIER: Record<string, number> = {
  "黑化趋势·小清新": 1,
  "黑化趋势·情绪波动": 2,
  "黑化趋势·易燃易炸": 3,
  "黑化趋势·建议在冷静期再战": 4,
  "黑化趋势·未定档": 1,
};

export function formatDarknessScoreRange(tier: DarknessResultTier): string {
  if (tier.scoreMax == null) return `${tier.scoreMin}+ 点`;
  if (tier.scoreMin === tier.scoreMax) return `${tier.scoreMin} 点`;
  return `${tier.scoreMin}–${tier.scoreMax} 点`;
}

/** 说明页展示：黑化值 0–5 */
export function formatDarknessScoreRangeLabel(tier: DarknessResultTier): string {
  if (tier.scoreMax == null) return `黑化值 > ${tier.scoreMin - 1}`;
  if (tier.scoreMin === tier.scoreMax) return `黑化值 ${tier.scoreMin}`;
  return `黑化值 ${tier.scoreMin}–${tier.scoreMax}`;
}

export function resolveDarknessResultTier(score: number): DarknessResultTier {
  const s = Number.isFinite(score) ? Math.max(0, Math.round(score)) : 0;
  for (let i = 0; i < DARKNESS_RESULT_TIERS.length; i += 1) {
    const t = DARKNESS_RESULT_TIERS[i]!;
    if (t.scoreMax == null) {
      if (s >= t.scoreMin) return t;
    } else if (s >= t.scoreMin && s <= t.scoreMax) {
      return t;
    }
  }
  return DARKNESS_RESULT_TIERS[0]!;
}

export function readDarknessScore(result: unknown): number | null {
  if (!result || typeof result !== "object") return null;
  const raw = (result as { counts?: Record<string, number> }).counts?.["黑化分值"];
  return typeof raw === "number" ? raw : null;
}

export function resolveDarknessResultTierFromResult(result: unknown): DarknessResultTier {
  const score = readDarknessScore(result);
  if (score != null) return resolveDarknessResultTier(score);
  if (result && typeof result === "object") {
    const type = String((result as { type?: string }).type || "").trim();
    const legacyId = LEGACY_DARKNESS_TYPE_TIER[type];
    if (legacyId) {
      return DARKNESS_RESULT_TIERS.find((t) => t.id === legacyId) ?? DARKNESS_RESULT_TIERS[0]!;
    }
    const byLabel = DARKNESS_RESULT_TIERS.find(
      (t) =>
        t.typeLabel === type ||
        type.includes(t.title) ||
        (t.title === "轻度黑化" && type.includes("轻度黑化")),
    );
    if (byLabel) return byLabel;
  }
  return DARKNESS_RESULT_TIERS[0]!;
}

export interface DarknessResultPresentation {
  typeCode: string;
  alias: string;
  keywords: string[];
  summary: string;
  strengths: string;
  fit: string;
  typeLabel: string;
  score: number;
}

/** 方案 A：大字档位名 + 小字倾向分 + 标签与三段正文 */
export function buildDarknessResultPresentation(result: unknown): DarknessResultPresentation {
  const score = readDarknessScore(result) ?? 0;
  const tier = resolveDarknessResultTierFromResult(result);
  const keywords = [tier.riskHint, ...tier.keywordTags].filter(Boolean).slice(0, 3);
  return {
    typeCode: tier.title,
    alias: `倾向分 ${score} 点`,
    keywords,
    summary: tier.summary,
    strengths: tier.innerVoice,
    fit: tier.tip,
    typeLabel: tier.typeLabel,
    score,
  };
}
