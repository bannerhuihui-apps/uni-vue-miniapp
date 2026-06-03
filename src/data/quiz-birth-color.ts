/**
 * 「本命颜色测试」— 题库（来源：`本命颜色测试.xlsx` · 测试题目）
 * 每题 A/B/C/D = 1/2/3/4 分，总分 10–40，档位见 `BIRTH_COLOR_TIER_META`。
 */

import type { PeachBlossomQuestionItem } from "./quiz-scored-types";
import { BIRTH_COLOR_QUIZ_ID, SCORED_QUIZ_SCHEMA_V1 } from "./quiz-scored-types";

export { BIRTH_COLOR_QUIZ_ID, SCORED_QUIZ_SCHEMA_V1 };

export const birthColorQuizMeta = {
  quizId: BIRTH_COLOR_QUIZ_ID,
  schemaVersion: SCORED_QUIZ_SCHEMA_V1,
  title: "本命颜色测试",
  questionCount: 10,
} as const;

/** 结果说明表原文摘要，供结果页 / 说明页引用 */
export { BIRTH_COLOR_RESULT_TIERS } from "./quiz-birth-color-result-tiers";
import { BIRTH_COLOR_RESULT_TIERS } from "./quiz-birth-color-result-tiers";

export const BIRTH_COLOR_TIER_META: Record<
  string,
  { blurb: string; tagline: string }
> = Object.fromEntries(
  BIRTH_COLOR_RESULT_TIERS.map((tier) => [
    tier.title,
    {
      tagline: tier.tagline,
      blurb: tier.summary.replace(/^[^！!]+[！!]/, ""),
    },
  ]),
);

BIRTH_COLOR_TIER_META["未定档"] = {
  tagline: "待揭晓",
  blurb: "完成测试后将匹配你的趣味本命色。",
};

export const birthColorQuestions: PeachBlossomQuestionItem[] = [
  {
    id: "BC01",
    textSelf: "1. 独处时最常做的事？",
    textFriend: "1. 独处时TA最常做的事？",
    options: [
      { key: "A", textSelf: "A. 整理房间/写日记", textFriend: "A. 整理房间/写日记", score: 1 },
      { key: "B", textSelf: "B. 听音乐/发呆", textFriend: "B. 听音乐/发呆", score: 2 },
      { key: "C", textSelf: "C. 研究新技能/做规划", textFriend: "C. 研究新技能/做规划", score: 3 },
      { key: "D", textSelf: "D. 刷短视频/打游戏", textFriend: "D. 刷短视频/打游戏", score: 4 },
    ],
  },
  {
    id: "BC02",
    textSelf: "2. 遇到喜欢的人会？",
    textFriend: "2. 遇到喜欢的人TA会？",
    options: [
      { key: "A", textSelf: "A. 默默关注TA的动态", textFriend: "A. 默默关注TA的动态", score: 1 },
      { key: "B", textSelf: "B. 主动找话题接近", textFriend: "B. 主动找话题接近", score: 2 },
      { key: "C", textSelf: "C. 送TA小礼物表达好感", textFriend: "C. 送TA小礼物表达好感", score: 3 },
      { key: "D", textSelf: "D. 直接约TA出去玩", textFriend: "D. 直接约TA出去玩", score: 4 },
    ],
  },
  {
    id: "BC03",
    textSelf: "3. 旅行必带的三样东西？",
    textFriend: "3. 旅行时TA必带的三样东西？",
    options: [
      { key: "A", textSelf: "A. 充电宝/相机/笔记本", textFriend: "A. 充电宝/相机/笔记本", score: 1 },
      { key: "B", textSelf: "B. 香水/饰品/漂亮衣服", textFriend: "B. 香水/饰品/漂亮衣服", score: 2 },
      { key: "C", textSelf: "C. 零食/眼罩/轻便鞋", textFriend: "C. 零食/眼罩/轻便鞋", score: 3 },
      { key: "D", textSelf: "D. 书/耳机/便携水杯", textFriend: "D. 书/耳机/便携水杯", score: 4 },
    ],
  },
  {
    id: "BC04",
    textSelf: "4. 突然中奖100万会？",
    textFriend: "4. 突然中奖100万TA会？",
    options: [
      { key: "A", textSelf: "A. 存银行/理财规划", textFriend: "A. 存银行/理财规划", score: 1 },
      { key: "B", textSelf: "B. 买奢侈品/环游世界", textFriend: "B. 买奢侈品/环游世界", score: 2 },
      { key: "C", textSelf: "C. 给家人朋友买礼物", textFriend: "C. 给家人朋友买礼物", score: 3 },
      { key: "D", textSelf: "D. 投资创业/做公益", textFriend: "D. 投资创业/做公益", score: 4 },
    ],
  },
  {
    id: "BC05",
    textSelf: "5. 最不能忍受哪种行为？",
    textFriend: "5. TA最不能忍受哪种行为？",
    options: [
      { key: "A", textSelf: "A. 迟到/不守信用", textFriend: "A. 迟到/不守信用", score: 1 },
      { key: "B", textSelf: "B. 大声喧哗/没礼貌", textFriend: "B. 大声喧哗/没礼貌", score: 2 },
      { key: "C", textSelf: "C. 浪费食物/破坏环境", textFriend: "C. 浪费食物/破坏环境", score: 3 },
      { key: "D", textSelf: "D. 背后议论/双标", textFriend: "D. 背后议论/双标", score: 4 },
    ],
  },
  {
    id: "BC06",
    textSelf: "6. 收到陌生人的善意会？",
    textFriend: "6. 收到陌生人的善意TA会？",
    options: [
      { key: "A", textSelf: "A. 礼貌道谢后快速离开", textFriend: "A. 礼貌道谢后快速离开", score: 1 },
      { key: "B", textSelf: "B. 热情回应并聊几句", textFriend: "B. 热情回应并聊几句", score: 2 },
      { key: "C", textSelf: "C. 记在心里下次回馈", textFriend: "C. 记在心里下次回馈", score: 3 },
      { key: "D", textSelf: "D. 发朋友圈分享感动", textFriend: "D. 发朋友圈分享感动", score: 4 },
    ],
  },
  {
    id: "BC07",
    textSelf: "7. 选择饮料的标准是？",
    textFriend: "7. TA选择饮料的标准是？",
    options: [
      { key: "A", textSelf: "A. 解渴/功能性", textFriend: "A. 解渴/功能性", score: 1 },
      { key: "B", textSelf: "B. 颜值/拍照好看", textFriend: "B. 颜值/拍照好看", score: 2 },
      { key: "C", textSelf: "C. 健康/低卡路里", textFriend: "C. 健康/低卡路里", score: 3 },
      { key: "D", textSelf: "D. 新奇口味/限量款", textFriend: "D. 新奇口味/限量款", score: 4 },
    ],
  },
  {
    id: "BC08",
    textSelf: "8. 朋友吵架时你会？",
    textFriend: "8. 朋友吵架时TA会？",
    options: [
      { key: "A", textSelf: "A. 分析对错讲道理", textFriend: "A. 分析对错讲道理", score: 1 },
      { key: "B", textSelf: "B. 转移话题缓和气氛", textFriend: "B. 转移话题缓和气氛", score: 2 },
      { key: "C", textSelf: "C. 倾听双方情绪", textFriend: "C. 倾听双方情绪", score: 3 },
      { key: "D", textSelf: "D. 带他们去吃好吃的", textFriend: "D. 带他们去吃好吃的", score: 4 },
    ],
  },
  {
    id: "BC09",
    textSelf: "9. 手机相册里最多的照片？",
    textFriend: "9. TA手机相册里最多的照片？",
    options: [
      { key: "A", textSelf: "A. 工作资料/截图", textFriend: "A. 工作资料/截图", score: 1 },
      { key: "B", textSelf: "B. 自拍/美食打卡", textFriend: "B. 自拍/美食打卡", score: 2 },
      { key: "C", textSelf: "C. 风景/小动物", textFriend: "C. 风景/小动物", score: 3 },
      { key: "D", textSelf: "D. 表情包/搞笑视频", textFriend: "D. 表情包/搞笑视频", score: 4 },
    ],
  },
  {
    id: "BC10",
    textSelf: "10. 认为人生最重要的是？",
    textFriend: "10. TA认为人生最重要的是？",
    options: [
      { key: "A", textSelf: "A. 事业成就/自我实现", textFriend: "A. 事业成就/自我实现", score: 1 },
      { key: "B", textSelf: "B. 爱情/家庭幸福", textFriend: "B. 爱情/家庭幸福", score: 2 },
      { key: "C", textSelf: "C. 健康/内心平静", textFriend: "C. 健康/内心平静", score: 3 },
      { key: "D", textSelf: "D. 自由/体验不同生活", textFriend: "D. 自由/体验不同生活", score: 4 },
    ],
  },
];
