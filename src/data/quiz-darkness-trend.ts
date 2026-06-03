/**
 * 「黑化趋势」趣味测试 — 题库数据（来源：`黑化趋势测试.xlsx`）
 * @see quiz-scored-types.ts
 */

import type { DarknessTrendQuestionItem } from "./quiz-scored-types";
import {
  DARKNESS_TREND_QUIZ_ID,
  SCORED_QUIZ_SCHEMA_V1,
} from "./quiz-scored-types";

export { DARKNESS_TREND_QUIZ_ID, SCORED_QUIZ_SCHEMA_V1 };

/** 题库元信息（入库、埋点可与题目一并引用） */
export const darknessTrendQuizMeta = {
  quizId: DARKNESS_TREND_QUIZ_ID,
  schemaVersion: SCORED_QUIZ_SCHEMA_V1,
  title: "黑化趋势测试",
  questionCount: 10,
} as const;

/** 标准题库：每条含自测题干、朋友视角题干、分项黑化加成 */
export const darknessTrendQuestions: DarknessTrendQuestionItem[] = [
  {
    id: "D01",
    textSelf: "1. 朋友聚会时，有人偷偷把你的蛋糕换成芥末味，你会？",
    textFriend: "1. 你朋友被同事抢功后，他的反应最可能是？",
    options: [
      {
        key: "A",
        textSelf: "A. 笑着吃掉，说“这创意我给满分”",
        textFriend: "A. 笑着说“团队成功就好”",
        darknessDeltaSelf: 0,
        darknessDeltaFriend: 0,
      },
      {
        key: "B",
        textSelf: "B. 当场揭穿，要求对方道歉",
        textFriend: "B. 冷静找领导说明情况",
        darknessDeltaSelf: 1,
        darknessDeltaFriend: 1,
      },
      {
        key: "C",
        textSelf: "C. 默默记仇，下次用十倍辣度回敬",
        textFriend: "C. 私下吐槽“下次绝对不帮了”",
        darknessDeltaSelf: 2,
        darknessDeltaFriend: 2,
      },
      {
        key: "D",
        textSelf: "D. 直接把蛋糕糊对方脸上，转身离开",
        textFriend: "D. 立刻发朋友圈阴阳对方",
        darknessDeltaSelf: 3,
        darknessDeltaFriend: 3,
      },
    ],
  },
  {
    id: "D02",
    textSelf: "2. 熬夜赶工的项目被同事抢功，领导表扬对方时，你内心？",
    textFriend: "2. 你朋友被插队还被瞪时，他通常会？",
    options: [
      {
        key: "A",
        textSelf: "A. “能帮到团队就好”",
        textFriend: "A. 温和提醒对方排队",
        darknessDeltaSelf: 0,
        darknessDeltaFriend: 0,
      },
      {
        key: "B",
        textSelf: "B. “下次要提前留证据”",
        textFriend: "B. 直接找工作人员处理",
        darknessDeltaSelf: 1,
        darknessDeltaFriend: 1,
      },
      {
        key: "C",
        textSelf: "C. “找机会让他也尝尝被抢的滋味”",
        textFriend: "C. 故意大声说“某些人没素质”",
        darknessDeltaSelf: 2,
        darknessDeltaFriend: 2,
      },
      {
        key: "D",
        textSelf: "D. “今晚就黑进他电脑删文件”",
        textFriend: "D. 假装不小心撞翻对方东西",
        darknessDeltaSelf: 3,
        darknessDeltaFriend: 3,
      },
    ],
  },
  {
    id: "D03",
    textSelf: "3. 排队买奶茶时被插队，对方还瞪你，你？",
    textFriend: "3. 你朋友发现暗恋的人官宣后，他第一时间会？",
    options: [
      {
        key: "A",
        textSelf: "A. 温和提醒“请排队哦”",
        textFriend: "A. 默默点赞祝福",
        darknessDeltaSelf: 0,
        darknessDeltaFriend: 0,
      },
      {
        key: "B",
        textSelf: "B. 直接找店员处理",
        textFriend: "B. 和朋友分析“为什么不是我”",
        darknessDeltaSelf: 1,
        darknessDeltaFriend: 1,
      },
      {
        key: "C",
        textSelf: "C. 故意大声说“某些人素质真感人”",
        textFriend: "C. 立刻发健身自拍配文“我会更好”",
        darknessDeltaSelf: 2,
        darknessDeltaFriend: 2,
      },
      {
        key: "D",
        textSelf: "D. 假装摔倒撞翻他的奶茶",
        textFriend: "D. 连夜注册小号去对方评论区挑刺",
        darknessDeltaSelf: 3,
        darknessDeltaFriend: 3,
      },
    ],
  },
  {
    id: "D04",
    textSelf: "4. 发现暗恋的人和别人官宣，你第一反应？",
    textFriend: "4. 你朋友被陌生人嘲笑穿搭，他会？",
    options: [
      {
        key: "A",
        textSelf: "A. “祝他幸福”",
        textFriend: "A. 笑笑说“个人审美不同”",
        darknessDeltaSelf: 0,
        darknessDeltaFriend: 0,
      },
      {
        key: "B",
        textSelf: "B. “原来他不喜欢我这类型”",
        textFriend: "B. 回怼“你的眼光才需要抢救”",
        darknessDeltaSelf: 1,
        darknessDeltaFriend: 1,
      },
      {
        key: "C",
        textSelf: "C. “我要变得更好让他后悔”",
        textFriend: "C. 偷偷拍对方丑照发群吐槽",
        darknessDeltaSelf: 2,
        darknessDeltaFriend: 2,
      },
      {
        key: "D",
        textSelf: "D. “立刻找新对象气死他”",
        textFriend: "D. 跟踪对方到小区门口贴匿名纸条",
        darknessDeltaSelf: 3,
        darknessDeltaFriend: 3,
      },
    ],
  },
  {
    id: "D05",
    textSelf: "5. 游戏里被队友坑到掉段，你会？",
    textFriend: "5. 你朋友熬夜做的方案被否决，他会？",
    options: [
      {
        key: "A",
        textSelf: "A. “下次一起练配合”",
        textFriend: "A. 主动问“哪里需要改进”",
        darknessDeltaSelf: 0,
        darknessDeltaFriend: 0,
      },
      {
        key: "B",
        textSelf: "B. 拉黑对方，自己单排",
        textFriend: "B. 整理数据重新提交",
        darknessDeltaSelf: 1,
        darknessDeltaFriend: 1,
      },
      {
        key: "C",
        textSelf: "C. 开小号加他好友，故意坑回去",
        textFriend: "C. 在茶水间吐槽领导“不懂装懂”",
        darknessDeltaSelf: 2,
        darknessDeltaFriend: 2,
      },
      {
        key: "D",
        textSelf: "D. 人肉他地址寄一箱蟑螂",
        textFriend: "D. 故意在后续项目里埋坑",
        darknessDeltaSelf: 3,
        darknessDeltaFriend: 3,
      },
    ],
  },
  {
    id: "D06",
    textSelf: "6. 同事总让你帮忙带咖啡却不给钱，今天又说“老样子”，你？",
    textFriend: "6. 你朋友发现闺蜜和前任在一起，他可能？",
    options: [
      {
        key: "A",
        textSelf: "A. 照常带，笑着说“下次记得转我哦”",
        textFriend: "A. 约闺蜜吃饭说“尊重你们”",
        darknessDeltaSelf: 0,
        darknessDeltaFriend: 0,
      },
      {
        key: "B",
        textSelf: "B. 直接拒绝“我也没空”",
        textFriend: "B. 直接问“为什么不告诉我”",
        darknessDeltaSelf: 1,
        darknessDeltaFriend: 1,
      },
      {
        key: "C",
        textSelf: "C. 买杯超苦美式递给他",
        textFriend: "C. 在朋友圈发“有些人表面一套背后一套”",
        darknessDeltaSelf: 2,
        darknessDeltaFriend: 2,
      },
      {
        key: "D",
        textSelf: "D. 把咖啡换成酱油，看他喝下去",
        textFriend: "D. 假装撮合实则制造误会",
        darknessDeltaSelf: 3,
        darknessDeltaFriend: 3,
      },
    ],
  },
  {
    id: "D07",
    textSelf: "7. 被陌生人当众嘲笑穿搭土，你？",
    textFriend: "7. 你朋友被父母扔掉珍藏品，他会？",
    options: [
      {
        key: "A",
        textSelf: "A. 笑笑说“个人风格不同”",
        textFriend: "A. 耐心解释收藏的意义",
        darknessDeltaSelf: 0,
        darknessDeltaFriend: 0,
      },
      {
        key: "B",
        textSelf: "B. 回怼“你的审美才需要抢救”",
        textFriend: "B. 要求父母赔偿或买新的",
        darknessDeltaSelf: 1,
        darknessDeltaFriend: 1,
      },
      {
        key: "C",
        textSelf: "C. 偷偷拍他丑照发朋友圈",
        textFriend: "C. 故意“弄丢”父母喜欢的物件",
        darknessDeltaSelf: 2,
        darknessDeltaFriend: 2,
      },
      {
        key: "D",
        textSelf: "D. 跟踪他回家，在他门口倒垃圾",
        textFriend: "D. 离家出走并拉黑全家一周",
        darknessDeltaSelf: 3,
        darknessDeltaFriend: 3,
      },
    ],
  },
  {
    id: "D08",
    textSelf: "8. 父母未经同意扔掉你的珍藏手办，你？",
    textFriend: "8. 你朋友游戏连输十局，他会？",
    options: [
      {
        key: "A",
        textSelf: "A. 耐心解释收藏的意义",
        textFriend: "A. 说“明天再战”",
        darknessDeltaSelf: 0,
        darknessDeltaFriend: 0,
      },
      {
        key: "B",
        textSelf: "B. 要求赔偿或买新的",
        textFriend: "B. 分析输的原因",
        darknessDeltaSelf: 1,
        darknessDeltaFriend: 1,
      },
      {
        key: "C",
        textSelf: "C. 把他们最爱的茶具“不小心”摔了",
        textFriend: "C. 开小号去坑队友",
        darknessDeltaSelf: 2,
        darknessDeltaFriend: 2,
      },
      {
        key: "D",
        textSelf: "D. 离家出走并拉黑全家一周",
        textFriend: "D. 人肉队友地址寄刀片",
        darknessDeltaSelf: 3,
        darknessDeltaFriend: 3,
      },
    ],
  },
  {
    id: "D09",
    textSelf: "9. 发现闺蜜和前任在一起了，你？",
    textFriend: "9. 你朋友被老板PUA“年轻人要吃苦”，他会？",
    options: [
      {
        key: "A",
        textSelf: "A. “尊重他们的选择”",
        textFriend: "A. 继续加班说“我会努力”",
        darknessDeltaSelf: 0,
        darknessDeltaFriend: 0,
      },
      {
        key: "B",
        textSelf: "B. 直接问“为什么瞒着我”",
        textFriend: "B. 提出调休或加班费要求",
        darknessDeltaSelf: 1,
        darknessDeltaFriend: 1,
      },
      {
        key: "C",
        textSelf: "C. 群发消息曝光他们黑历史",
        textFriend: "C. 故意拖延项目进度",
        darknessDeltaSelf: 2,
        darknessDeltaFriend: 2,
      },
      {
        key: "D",
        textSelf: "D. 假装祝福，实则策划“意外”拆散",
        textFriend: "D. 匿名举报公司违规操作",
        darknessDeltaSelf: 3,
        darknessDeltaFriend: 3,
      },
    ],
  },
  {
    id: "D10",
    textSelf: "10. 连续加班一个月，老板却说“年轻人别怕累”，你？",
    textFriend: "10. 你朋友被朋友放鸽子三次，他会？",
    options: [
      {
        key: "A",
        textSelf: "A. “我会继续努力”",
        textFriend: "A. 说“下次再约”",
        darknessDeltaSelf: 0,
        darknessDeltaFriend: 0,
      },
      {
        key: "B",
        textSelf: "B. 提出调休或加班费要求",
        textFriend: "B. 直接问“是不是不想见”",
        darknessDeltaSelf: 1,
        darknessDeltaFriend: 1,
      },
      {
        key: "C",
        textSelf: "C. 故意把项目数据搞错让他背锅",
        textFriend: "C. 在朋友圈发“某些人的承诺像空气”",
        darknessDeltaSelf: 2,
        darknessDeltaFriend: 2,
      },
      {
        key: "D",
        textSelf: "D. 匿名举报公司偷税漏税",
        textFriend: "D. 故意约对方到偏远地方然后消失",
        darknessDeltaSelf: 3,
        darknessDeltaFriend: 3,
      },
    ],
  },
];
