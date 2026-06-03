/**
 * 「花痴指数」趣味测试 — 题库（来源：`花痴指数.xlsx` · 测试题目sheet）
 * 评分：A=1，B=2，C=3，D=0；总分 0–30，档位见表「测试结果」。
 * @see quiz-scored-types.ts
 */

import type { PeachBlossomQuestionItem } from "./quiz-scored-types";
import { CRUSH_INDEX_QUIZ_ID, SCORED_QUIZ_SCHEMA_V1 } from "./quiz-scored-types";

export { CRUSH_INDEX_QUIZ_ID, SCORED_QUIZ_SCHEMA_V1 };

export const crushIndexQuizMeta = {
  quizId: CRUSH_INDEX_QUIZ_ID,
  schemaVersion: SCORED_QUIZ_SCHEMA_V1,
  title: "花痴指数测试",
  questionCount: 10,
} as const;

export const crushIndexQuestions: PeachBlossomQuestionItem[] = [
  {
    id: "H01",
    textSelf: "1. 看到帅哥/美女时，你的第一反应是？",
    textFriend: "1. TA看到帅哥/美女时，第一反应通常是？",
    options: [
      {
        key: "A",
        textSelf: "A. 表面淡定内心狂喜，默默记下穿搭风格",
        textFriend: "A. 表面淡定，但会偷偷多看几眼，事后可能和你提一嘴",
        score: 1,
      },
      {
        key: "B",
        textSelf: "B. 立刻和朋友分享「今天遇到天菜！」",
        textFriend: "B. 立刻戳你微信：「快看！我遇到天菜了！」",
        score: 2,
      },
      {
        key: "C",
        textSelf: "C. 直接上前要联系方式，主动出击",
        textFriend: "C. 直接上前要联系方式，还会回头冲你挑眉炫耀",
        score: 3,
      },
      {
        key: "D",
        textSelf: "D. 完全没注意，专注自己的事",
        textFriend: "D. 完全没注意，专注手里的奶茶或手机",
        score: 0,
      },
    ],
  },
  {
    id: "H02",
    textSelf: "2. 朋友发来明星照片，你的回复是？",
    textFriend: "2. 你给TA发明星帅照/美图，TA一般怎么回？",
    options: [
      {
        key: "A",
        textSelf: "A. 「这颜值我可以看一整天！」",
        textFriend: "A. 「这颜值我可以看一整天！」",
        score: 1,
      },
      {
        key: "B",
        textSelf: "B. 「已存图，今晚做梦素材有了！」",
        textFriend: "B. 「已存图，今晚做梦素材有了！」",
        score: 2,
      },
      {
        key: "C",
        textSelf: "C. 「求原图！我要打印贴床头！」",
        textFriend: "C. 「求原图！我要打印贴床头！」",
        score: 3,
      },
      {
        key: "D",
        textSelf: "D. 「哦，还行吧。」",
        textFriend: "D. 「哦，还行吧。」",
        score: 0,
      },
    ],
  },
  {
    id: "H03",
    textSelf: "3. 刷到偶像视频时，你会？",
    textFriend: "3. TA刷到偶像视频时，会做什么？",
    options: [
      {
        key: "A",
        textSelf: "A. 反复观看，截图每一帧表情包",
        textFriend: "A. 反复观看，截图每一帧表情包发给你",
        score: 1,
      },
      {
        key: "B",
        textSelf: "B. 转发到所有群聊并配文「我老公/老婆！」",
        textFriend: "B. 转发到所有群聊并配文「我老公/老婆！」",
        score: 2,
      },
      {
        key: "C",
        textSelf: "C. 立刻搜索同款衣服/饰品下单",
        textFriend: "C. 立刻搜索同款衣服/饰品下单",
        score: 3,
      },
      {
        key: "D",
        textSelf: "D. 划走，继续刷其他内容",
        textFriend: "D. 划走，继续刷其他内容",
        score: 0,
      },
    ],
  },
  {
    id: "H04",
    textSelf: "4. 听到有人吐槽你喜欢的明星，你会？",
    textFriend: "4. 听到有人吐槽TA喜欢的明星，TA会？",
    options: [
      {
        key: "A",
        textSelf: "A. 耐心解释TA的优点，试图安利",
        textFriend: "A. 耐心解释明星的优点，试图安利对方",
        score: 1,
      },
      {
        key: "B",
        textSelf: "B. 直接怼回去「你根本不懂TA的好！」",
        textFriend: "B. 直接怼回去「你根本不懂TA的好！」",
        score: 2,
      },
      {
        key: "C",
        textSelf: "C. 默默拉黑对方，眼不见为净",
        textFriend: "C. 默默拉黑对方，眼不见为净",
        score: 3,
      },
      {
        key: "D",
        textSelf: "D. 无所谓，各花入各眼",
        textFriend: "D. 无所谓，各花入各眼",
        score: 0,
      },
    ],
  },
  {
    id: "H05",
    textSelf: "5. 以下哪种行为你最可能做？",
    textFriend: "5. 以下哪种行为TA最可能做？",
    options: [
      {
        key: "A",
        textSelf: "A. 给偶像打榜投票到凌晨",
        textFriend: "A. 给偶像打榜投票到凌晨",
        score: 1,
      },
      {
        key: "B",
        textSelf: "B. 存满手机相册的偶像照片",
        textFriend: "B. 存满手机相册的偶像照片",
        score: 2,
      },
      {
        key: "C",
        textSelf: "C. 为偶像学习剪辑视频技能",
        textFriend: "C. 为偶像学习剪辑视频技能",
        score: 3,
      },
      {
        key: "D",
        textSelf: "D. 从不追星，觉得浪费时间",
        textFriend: "D. 从不追星，觉得浪费时间",
        score: 0,
      },
    ],
  },
  {
    id: "H06",
    textSelf: "6. 看到偶像官宣恋情，你的反应是？",
    textFriend: "6. 看到偶像官宣恋情，TA的反应是？",
    options: [
      {
        key: "A",
        textSelf: "A. 含泪祝福「TA幸福就好」",
        textFriend: "A. 含泪祝福「TA幸福就好」",
        score: 1,
      },
      {
        key: "B",
        textSelf: "B. 立刻脱粉并吐槽「眼光太差！」",
        textFriend: "B. 立刻脱粉并吐槽「眼光太差！」",
        score: 2,
      },
      {
        key: "C",
        textSelf: "C. 坚信是炒作，等辟谣公告",
        textFriend: "C. 坚信是炒作，等辟谣公告",
        score: 3,
      },
      {
        key: "D",
        textSelf: "D. 完全不关心，继续吃瓜",
        textFriend: "D. 完全不关心，继续吃瓜",
        score: 0,
      },
    ],
  },
  {
    id: "H07",
    textSelf: "7. 朋友说你和偶像长得像，你会？",
    textFriend: "7. 你说TA和偶像长得像，TA会？",
    options: [
      {
        key: "A",
        textSelf: "A. 开心到转圈，立刻换头像「碰瓷」",
        textFriend: "A. 开心到转圈，立刻换头像「碰瓷」",
        score: 1,
      },
      {
        key: "B",
        textSelf: "B. 谦虚摆手「别闹，我哪有TA好看」",
        textFriend: "B. 谦虚摆手「别闹，我哪有TA好看」",
        score: 2,
      },
      {
        key: "C",
        textSelf: "C. 追问「哪里像？眼睛还是鼻子？」",
        textFriend: "C. 追问「哪里像？眼睛还是鼻子？」",
        score: 3,
      },
      {
        key: "D",
        textSelf: "D. 一脸懵「谁？我不认识这人」",
        textFriend: "D. 一脸懵「谁？我不认识这人」",
        score: 0,
      },
    ],
  },
  {
    id: "H08",
    textSelf: "8. 以下哪句话最像你的口头禅？",
    textFriend: "8. 以下哪句话最像TA的口头禅？",
    options: [
      {
        key: "A",
        textSelf: "A. 「这个颜值是真实存在的吗？」",
        textFriend: "A. 「这个颜值是真实存在的吗？」",
        score: 1,
      },
      {
        key: "B",
        textSelf: "B. 「我可以单身，但我的CP必须结婚！」",
        textFriend: "B. 「我可以单身，但我的CP必须结婚！」",
        score: 2,
      },
      {
        key: "C",
        textSelf: "C. 「追星是我生活的动力！」",
        textFriend: "C. 「追星是我生活的动力！」",
        score: 3,
      },
      {
        key: "D",
        textSelf: "D. 「明星也是普通人，没必要疯狂。」",
        textFriend: "D. 「明星也是普通人，没必要疯狂。」",
        score: 0,
      },
    ],
  },
  {
    id: "H09",
    textSelf: "9. 为偶像花钱最多的一次是？",
    textFriend: "9. TA为偶像花钱最多的一次是？",
    options: [
      {
        key: "A",
        textSelf: "A. 买专辑/周边，支持作品",
        textFriend: "A. 买专辑/周边，支持作品",
        score: 1,
      },
      {
        key: "B",
        textSelf: "B. 飞外地看演唱会，前排尖叫",
        textFriend: "B. 飞外地看演唱会，前排尖叫",
        score: 2,
      },
      {
        key: "C",
        textSelf: "C. 定制偶像同款应援物，人手一份",
        textFriend: "C. 定制偶像同款应援物，人手一份",
        score: 3,
      },
      {
        key: "D",
        textSelf: "D. 从不花钱，白嫖最快乐",
        textFriend: "D. 从不花钱，白嫖最快乐",
        score: 0,
      },
    ],
  },
  {
    id: "H10",
    textSelf: "10. 如果穿越成偶像的助理，你会？",
    textFriend: "10. 如果穿越成偶像的助理，TA会？",
    options: [
      {
        key: "A",
        textSelf: "A. 贴心准备TA爱吃的零食和日程表",
        textFriend: "A. 贴心准备偶像爱吃的零食和日程表",
        score: 1,
      },
      {
        key: "B",
        textSelf: "B. 偷偷拍TA素颜照发粉丝群福利",
        textFriend: "B. 偷偷拍偶像素颜照发粉丝群福利",
        score: 2,
      },
      {
        key: "C",
        textSelf: "C. 每天催TA发微博，满足粉丝需求",
        textFriend: "C. 每天催偶像发微博，满足粉丝需求",
        score: 3,
      },
      {
        key: "D",
        textSelf: "D. 认真工作，保持专业距离",
        textFriend: "D. 认真工作，保持专业距离",
        score: 0,
      },
    ],
  },
];
