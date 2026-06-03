/**
 * 「桃花体质」趣味测试 — 题库数据（来源：`桃花体质测试.xlsx`）
 * @see quiz-scored-types.ts
 */

import type { PeachBlossomQuestionItem } from "./quiz-scored-types";
import {
  PEACH_BLOSSOM_QUIZ_ID,
  SCORED_QUIZ_SCHEMA_V1,
} from "./quiz-scored-types";

export { PEACH_BLOSSOM_QUIZ_ID, SCORED_QUIZ_SCHEMA_V1 };

export const peachBlossomQuizMeta = {
  quizId: PEACH_BLOSSOM_QUIZ_ID,
  schemaVersion: SCORED_QUIZ_SCHEMA_V1,
  title: "桃花体质测试",
  questionCount: 10,
} as const;

export const peachBlossomQuestions: PeachBlossomQuestionItem[] = [
  {
    id: "P01",
    textSelf: "1. 当你走进一个聚会场合，通常会？",
    textFriend: "1. 当我第一次见到他/她时，感觉他/她？",
    options: [
      {
        key: "A",
        textSelf: "A. 很快有人主动找你聊天，你只需礼貌回应",
        textFriend: "A. 自带吸引力，让人不自觉想靠近",
        score: 3,
      },
      {
        key: "B",
        textSelf: "B. 主动寻找感兴趣的人开启话题",
        textFriend: "B. 很会展现自己，主动与人建立联系",
        score: 4,
      },
      {
        key: "C",
        textSelf: "C. 安静待在角落，观察周围环境",
        textFriend: "C. 需要时间相处才能发现魅力",
        score: 2,
      },
      {
        key: "D",
        textSelf: "D. 只跟熟悉的朋友交谈，不太接触陌生人",
        textFriend: "D. 比较低调，不太引人注目",
        score: 1,
      },
    ],
  },
  {
    id: "P02",
    textSelf: "2. 朋友如何评价你的异性缘？",
    textFriend: "2. 在聚会场合中，他/她通常是？",
    options: [
      {
        key: "A",
        textSelf: 'A. "你身边总是不缺追求者"',
        textFriend: "A. 经常被人搭讪或关注的对象",
        score: 3,
      },
      {
        key: "B",
        textSelf: 'B. "你很会创造恋爱机会"',
        textFriend: "B. 主动活跃气氛，与不同人交谈",
        score: 4,
      },
      {
        key: "C",
        textSelf: 'C. "你的桃花需要别人帮忙牵线"',
        textFriend: "C. 主要和熟悉的朋友待在一起",
        score: 2,
      },
      {
        key: "D",
        textSelf: 'D. "你似乎对恋爱不太感兴趣"',
        textFriend: "D. 安静观察，很少主动社交",
        score: 1,
      },
    ],
  },
  {
    id: "P03",
    textSelf: "3. 在社交平台上，你的互动情况是？",
    textFriend: "3. 从他/她的社交动态来看？",
    options: [
      {
        key: "A",
        textSelf: "A. 经常收到陌生人的点赞和私信",
        textFriend: "A. 总有很多人点赞评论，包括不少异性",
        score: 3,
      },
      {
        key: "B",
        textSelf: "B. 主动关注感兴趣的人并建立联系",
        textFriend: "B. 他/她会主动发起话题和互动",
        score: 4,
      },
      {
        key: "C",
        textSelf: "C. 偶尔有互动，但大多是熟人",
        textFriend: "C. 互动不多但稳定，主要是熟人",
        score: 2,
      },
      {
        key: "D",
        textSelf: "D. 基本不发布内容，也很少互动",
        textFriend: "D. 很少发动态，也不常互动",
        score: 1,
      },
    ],
  },
  {
    id: "P04",
    textSelf: "4. 遇到喜欢的人，你通常会？",
    textFriend: "4. 在感情方面，他/她更倾向于？",
    options: [
      {
        key: "A",
        textSelf: "A. 等待对方先表示好感",
        textFriend: "A. 等待别人表达好感",
        score: 3,
      },
      {
        key: "B",
        textSelf: "B. 制造机会接近和表白",
        textFriend: "B. 主动追求喜欢的人",
        score: 4,
      },
      {
        key: "C",
        textSelf: "C. 通过朋友传递心意",
        textFriend: "C. 通过朋友介绍认识对象",
        score: 2,
      },
      {
        key: "D",
        textSelf: "D. 默默欣赏，不采取行动",
        textFriend: "D. 对恋爱似乎不太积极",
        score: 1,
      },
    ],
  },
  {
    id: "P05",
    textSelf: "5. 你的穿衣打扮风格是？",
    textFriend: "5. 他/她的魅力主要体现在？",
    options: [
      {
        key: "A",
        textSelf: "A. 经常被人称赞有吸引力",
        textFriend: "A. 天生的气质和吸引力",
        score: 3,
      },
      {
        key: "B",
        textSelf: "B. 根据场合精心搭配以展现魅力",
        textFriend: "B. 积极自信的社交能力",
        score: 4,
      },
      {
        key: "C",
        textSelf: "C. 舒适为主，不太在意他人眼光",
        textFriend: "C. 深入了解后发现的优点",
        score: 2,
      },
      {
        key: "D",
        textSelf: "D. 保守低调，避免引起注意",
        textFriend: "D. 需要特定情境才能展现",
        score: 1,
      },
    ],
  },
  {
    id: "P06",
    textSelf: "6. 情人节或生日时，你通常？",
    textFriend: "6. 节假日时，他/她通常？",
    options: [
      {
        key: "A",
        textSelf: "A. 收到不少礼物和祝福",
        textFriend: "A. 收到不少礼物和祝福",
        score: 3,
      },
      {
        key: "B",
        textSelf: "B. 主动组织聚会或约会",
        textFriend: "B. 主动组织活动和聚会",
        score: 4,
      },
      {
        key: "C",
        textSelf: "C. 有一两个亲密朋友的问候",
        textFriend: "C. 有一两个亲密朋友的问候",
        score: 2,
      },
      {
        key: "D",
        textSelf: "D. 和平常日子没什么区别",
        textFriend: "D. 和平常没什么不同",
        score: 1,
      },
    ],
  },
  {
    id: "P07",
    textSelf: "7. 在爱情中，你更相信？",
    textFriend: "7. 在朋友眼中，他/她的异性缘？",
    options: [
      {
        key: "A",
        textSelf: "A. 缘分天注定，该来的总会来",
        textFriend: "A. 总是有人暗恋或明恋他/她",
        score: 3,
      },
      {
        key: "B",
        textSelf: "B. 幸福需要自己主动争取",
        textFriend: "B. 他/她很会创造恋爱机会",
        score: 4,
      },
      {
        key: "C",
        textSelf: "C. 好的感情需要朋友和家人推荐",
        textFriend: "C. 需要朋友帮忙撮合",
        score: 2,
      },
      {
        key: "D",
        textSelf: "D. 单身也很自在，不必强求",
        textFriend: "D. 似乎对恋爱不太感兴趣",
        score: 1,
      },
    ],
  },
  {
    id: "P08",
    textSelf: "8. 别人通常用哪个词形容你的魅力？",
    textFriend: "8. 如果有人对他/她有好感，通常会？",
    options: [
      {
        key: "A",
        textSelf: 'A. "迷人"-不自觉吸引他人',
        textFriend: "A. 直接向他/她表白",
        score: 3,
      },
      {
        key: "B",
        textSelf: 'B. "热情"-主动散发能量',
        textFriend: "B. 他/她先察觉并做出回应",
        score: 4,
      },
      {
        key: "C",
        textSelf: 'C. "温和"-需要时间慢慢了解',
        textFriend: "C. 通过朋友传递心意",
        score: 2,
      },
      {
        key: "D",
        textSelf: 'D. "内敛"-不轻易表露情感',
        textFriend: "D. 很难被发现，因为他/她不太注意这些",
        score: 1,
      },
    ],
  },
  {
    id: "P09",
    textSelf: "9. 你认为自己的桃花特质更像哪种花？",
    textFriend: "9. 他/她对待爱情的态度更接近？",
    options: [
      {
        key: "A",
        textSelf: "A. 玫瑰-美丽带刺，自然吸引目光",
        textFriend: "A. 相信缘分，等待对的人",
        score: 3,
      },
      {
        key: "B",
        textSelf: "B. 向日葵-主动朝向阳光，积极灿烂",
        textFriend: "B. 主动寻找合适的机会",
        score: 4,
      },
      {
        key: "C",
        textSelf: "C. 茉莉-清香淡淡，需要靠近才能发现",
        textFriend: "C. 听从朋友的建议",
        score: 2,
      },
      {
        key: "D",
        textSelf: "D. 仙人掌-在特定环境才开花",
        textFriend: "D. 顺其自然，不太强求",
        score: 1,
      },
    ],
  },
  {
    id: "P10",
    textSelf: "10. 你对理想爱情的态度是？",
    textFriend: "10. 总体来说，他/她的桃花特质更像？",
    options: [
      {
        key: "A",
        textSelf: 'A. 等待那个"对的人"出现',
        textFriend: "A. 盛开的花朵-自然吸引蝴蝶",
        score: 3,
      },
      {
        key: "B",
        textSelf: "B. 主动寻找和创造机会",
        textFriend: "B. 阳光-主动照耀温暖他人",
        score: 4,
      },
      {
        key: "C",
        textSelf: "C. 依靠亲友介绍和撮合",
        textFriend: "C. 含苞待放-需要时机绽放",
        score: 2,
      },
      {
        key: "D",
        textSelf: "D. 随遇而安，不强求不拒绝",
        textFriend: "D. 仙人掌-在特定条件下才开花",
        score: 1,
      },
    ],
  },
];
