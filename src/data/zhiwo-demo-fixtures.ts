/** 仅占位文案，不包含真实题库 / 服务端 */

export interface TypeExplain {
  type: string;
  alias: string;
  keywords: string[];
  summary: string;
  strengths: string;
  fit: string;
}

export const TYPE_CATALOG: TypeExplain[] = [
  {
    type: "INTJ",
    alias: "建筑师",
    keywords: ["独立", "战略", "理性"],
    summary: "长于抽象推演与系统设计，偏爱清晰目标下的深度投入。演示内容，与实际测试无关。",
    strengths: "自律、洞察力、决断力。（演示占位）",
    fit: "研究、架构、战略规划等需要长期专注的方向。（演示占位）",
  },
  {
    type: "INFJ",
    alias: "提倡者",
    keywords: ["共情", "理想", "坚持"],
    summary: "在价值与关系中寻找意义，常为长远愿景默默推进。此为静态示例，不参与真实分型。",
    strengths: "倾听、洞察力、奉献精神。（演示占位）",
    fit: "心理咨询、社群运营、创意设计等人文关怀场景。（演示占位）",
  },
  {
    type: "ENFP",
    alias: "竞选者",
    keywords: ["热情", "即兴", "共鸣"],
    summary: "以热情与连结感带动氛围，常与人群保持高密度互动。（演示占位）",
    strengths: "感染力、开放性、洞察力。（演示）",
    fit: "市场、活动策划、公共关系等外向场景。（演示）",
  },
];

export function typeByCode(code: string | undefined): TypeExplain {
  const c = String(code ?? "").trim().toUpperCase();
  return TYPE_CATALOG.find((x) => x.type === c) ?? TYPE_CATALOG[1];
}

export const DEMO_QUIZ_LINES = [
  {
    mutualHint: false,
    remaining: 12,
    pct: 8,
    q: "在聚会中你更常被能量来源描述为哪一种？（演示题干）",
    a: "与多人互动能让我迅速兴奋起来",
    b: "小段深聊或小范围交流更让我感到舒适",
  },
  {
    mutualHint: true,
    mutualName: "小知",
    remaining: 6,
    pct: 52,
    q: "当计划临时变动时，你通常会？（演示题干）",
    a: "快速调整并接受新玩法",
    b: "需要时间整理情绪和替代方案",
  },
  {
    mutualHint: false,
    remaining: 1,
    pct: 96,
    q: "面对长期项目，你更看重？（演示题干）",
    a: "过程灵活、允许迭代试错",
    b: "节奏稳定、按计划推进更清晰",
  },
];

/** 测验结果页 / 演示 */
export const DEMO_RESULT_CARD = {
  pageTitleSelf: "自测结果",
  pageTitleMutual: "朋友测评结果",
  typeCode: "INFJ",
  alias: "提倡者",
  keywords: ["共情", "理想", "坚持"],
  showDimension: true,
  dimRows: [
    {
      grad: `linear-gradient(90deg, var(--qy-dim-ie-1) 0%, var(--qy-dim-ie-0) 100%)`,
      splitPercent: 62,
      leftCaption: "内向 I",
      rightCaption: "外向 E",
    },
    {
      grad: `linear-gradient(90deg, var(--qy-dim-sn-0) 0%, var(--qy-dim-sn-1) 100%)`,
      splitPercent: 48,
      leftCaption: "实感 S",
      rightCaption: "直觉 N",
    },
    {
      grad: `linear-gradient(90deg, var(--qy-dim-tf-1) 0%, var(--qy-dim-tf-0) 100%)`,
      splitPercent: 55,
      leftCaption: "思考 T",
      rightCaption: "情感 F",
    },
    {
      grad: `linear-gradient(90deg, var(--qy-dim-jp-0) 0%, var(--qy-dim-jp-1) 100%)`,
      splitPercent: 40,
      leftCaption: "判断 J",
      rightCaption: "知觉 P",
    },
  ],
  summary:
    "在价值驱动与长期愿景上投入了较多心力，也愿意为重要的人腾出空间。（演示占位，非真实分析报告）",
  strengths: "能坚持内心标准，并在复杂情境里保持洞察力。（演示）",
  fit: "需要深度沟通与创意整合的场景更易发挥。（演示）",
};

/** 测试记录列表 */
export const DEMO_RECORD_ROWS = [
  {
    id: "demo-record-1",
    typeCode: "INFJ",
    alias: "提倡者",
    keywords: ["共情", "理想"],
    mutualTotal: 10,
    showToday: true,
    todayCount: 1,
    timeText: "2026-05-18 更新",
  },
  {
    id: "demo-record-2",
    typeCode: "INTJ",
    alias: "建筑师",
    keywords: ["独立", "战略"],
    mutualTotal: 0,
    showToday: false,
    todayCount: 0,
    timeText: "2026-03-02 提交",
  },
];

/** 邀请页列表（首页「朋友测评」→ 本列表；演示 10 条便于看滚动） */
export const DEMO_INVITE_ROWS = [
  {
    id: "demo-inv-1",
    typeCode: "INFJ",
    alias: "提倡者",
    keywords: ["共情", "理想"],
    timeText: "2026-05-18",
  },
  {
    id: "demo-inv-2",
    typeCode: "INTJ",
    alias: "建筑师",
    keywords: ["独立", "战略"],
    timeText: "2026-05-17",
  },
  {
    id: "demo-inv-3",
    typeCode: "ENFP",
    alias: "竞选者",
    keywords: ["热情", "即兴"],
    timeText: "2026-05-16",
  },
  {
    id: "demo-inv-4",
    typeCode: "INFJ",
    alias: "提倡者",
    keywords: ["共情", "坚持"],
    timeText: "2026-05-14",
  },
  {
    id: "demo-inv-5",
    typeCode: "INTJ",
    alias: "建筑师",
    keywords: ["理性", "战略"],
    timeText: "2026-05-12",
  },
  {
    id: "demo-inv-6",
    typeCode: "ENFP",
    alias: "竞选者",
    keywords: ["共鸣", "热情"],
    timeText: "2026-05-10",
  },
  {
    id: "demo-inv-7",
    typeCode: "INFJ",
    alias: "提倡者",
    keywords: ["理想", "坚持"],
    timeText: "2026-05-09",
  },
  {
    id: "demo-inv-8",
    typeCode: "INTJ",
    alias: "建筑师",
    keywords: ["独立", "理性"],
    timeText: "2026-05-07",
  },
  {
    id: "demo-inv-9",
    typeCode: "ENFP",
    alias: "竞选者",
    keywords: ["即兴", "共鸣"],
    timeText: "2026-05-06",
  },
  {
    id: "demo-inv-10",
    typeCode: "INFJ",
    alias: "提倡者",
    keywords: ["共情", "理想", "坚持"],
    timeText: "2026-05-03",
  },
];

/** 朋友们眼中的你 - 单人记录下列表（演示 10 条，便于预览列表滚动与排版） */
export const DEMO_MUTUAL_FRIEND_ROWS = [
  {
    id: "f1",
    friendNickName: "阿树",
    friendType: "ENFP",
    viewerSelfType: "INFJ",
    timeText: "2026-05-17 完成",
    chipSame: false,
    chipText: "有差异",
  },
  {
    id: "f2",
    friendNickName: "鹿鸣",
    friendType: "INFJ",
    viewerSelfType: "INFJ",
    timeText: "2026-05-15 完成",
    chipSame: true,
    chipText: "一致型",
  },
  {
    id: "f3",
    friendNickName: "林川",
    friendType: "INTJ",
    viewerSelfType: "INFJ",
    timeText: "2026-05-14 完成",
    chipSame: false,
    chipText: "有差异",
  },
  {
    id: "f4",
    friendNickName: "小棠",
    friendType: "ENFJ",
    viewerSelfType: "INFJ",
    timeText: "2026-05-12 完成",
    chipSame: false,
    chipText: "有差异",
  },
  {
    id: "f5",
    friendNickName: "周砚",
    friendType: "ISTP",
    viewerSelfType: "INFJ",
    timeText: "2026-05-11 完成",
    chipSame: false,
    chipText: "有差异",
  },
  {
    id: "f6",
    friendNickName: "苏晚",
    friendType: "INFP",
    viewerSelfType: "INFJ",
    timeText: "2026-05-09 完成",
    chipSame: false,
    chipText: "有差异",
  },
  {
    id: "f7",
    friendNickName: "程远",
    friendType: "ENTP",
    viewerSelfType: "INFJ",
    timeText: "2026-05-08 完成",
    chipSame: false,
    chipText: "有差异",
  },
  {
    id: "f8",
    friendNickName: "谷雨",
    friendType: "ISFJ",
    viewerSelfType: "INFJ",
    timeText: "2026-05-06 完成",
    chipSame: false,
    chipText: "有差异",
  },
  {
    id: "f9",
    friendNickName: "江澄",
    friendType: "INFJ",
    viewerSelfType: "INFJ",
    timeText: "2026-05-05 完成",
    chipSame: true,
    chipText: "一致型",
  },
  {
    id: "f10",
    friendNickName: "夏屿",
    friendType: "ESTJ",
    viewerSelfType: "INFJ",
    timeText: "2026-05-03 完成",
    chipSame: false,
    chipText: "有差异",
  },
];

/** mutual-results 汇总演示 */
export const DEMO_MUTUAL_SUMMARY_ALL = {
  compositeParts: [
    { text: "I", disputed: false },
    { text: "N", disputed: true },
    { text: "F", disputed: false },
    { text: "J", disputed: false },
  ],
  aliasTop: "综合画像 · 演示",
  showTfControversyHint: true,
  topTypesText: "出现频率较高的字母：N、F（演示占位）",
  totalFriends: 10,
  dimUnlockNeed: 12,
  dimSectionMaskVisible: false,
  pillPairs: [
    [
      {
        pillTone: "pill-mint",
        leftLabel: "E",
        leftCount: 4,
        rightLabel: "I",
        rightCount: 6,
      },
      {
        pillTone: "pill-lemon",
        leftLabel: "S",
        leftCount: 2,
        rightLabel: "N",
        rightCount: 8,
      },
    ],
    [
      {
        pillTone: "pill-mint",
        leftLabel: "T",
        leftCount: 4,
        rightLabel: "F",
        rightCount: 6,
      },
      {
        pillTone: "pill-lemon",
        leftLabel: "J",
        leftCount: 6,
        rightLabel: "P",
        rightCount: 4,
      },
    ],
  ],
  dimRows: [
    {
      grad: `linear-gradient(90deg, var(--qy-dim-ie-1) 0%, var(--qy-dim-ie-0) 100%)`,
      leftPercent: 28,
      rightPercent: 72,
      leftLabel: "E",
      rightLabel: "I",
      splitHeavy: "right",
    },
    {
      grad: `linear-gradient(90deg, var(--qy-dim-sn-0) 0%, var(--qy-dim-sn-1) 100%)`,
      leftPercent: 55,
      rightPercent: 45,
      leftLabel: "S",
      rightLabel: "N",
      splitHeavy: "left",
    },
    {
      grad: `linear-gradient(90deg, var(--qy-dim-tf-1) 0%, var(--qy-dim-tf-0) 100%)`,
      leftPercent: 50,
      rightPercent: 50,
      leftLabel: "T",
      rightLabel: "F",
      splitHeavy: "even",
    },
    {
      grad: `linear-gradient(90deg, var(--qy-dim-jp-0) 0%, var(--qy-dim-jp-1) 100%)`,
      leftPercent: 62,
      rightPercent: 38,
      leftLabel: "J",
      rightLabel: "P",
      splitHeavy: "left",
    },
  ],
};

/** compare 页 */
export const DEMO_COMPARE = {
  selfTypesLabel: "本人自测类型",
  mutualTypesLabel: "朋友测评类型",
  selfType: "INFJ",
  selfAlias: "提倡者",
  mutualType: "ENFP",
  mutualAlias: "竞选者",
  score: "72",
  title: "你们在大方向上较为接近，在具体节奏和表达方式上仍存在差异。（演示占位）",
  lines: [
    "你更常在情绪与价值层面做决定，TA 更看重当下氛围与开放性。（示意）",
    "互测不提供医学或职业诊断，仅能作为娱乐交流参考。",
    "可复制下方合成文案发朋友圈或私聊复盘。（不含真实服务端生成）",
  ],
};
