'use strict'
/** 知我几分 MBTI 互测 20 题（由 知我几分-MBTI测试题-20.xlsx sheet2 同步） */

import type { QuizQuestion } from '@/state/minigame-app';

const data = [
  {
    "id": "M01",
    "text": "您朋友属于哪种类型？",
    "options": [
      {
        "text": "较为随兴所至的人",
        "letter": "P"
      },
      {
        "text": "较为有条理的人",
        "letter": "J"
      }
    ]
  },
  {
    "id": "M02",
    "text": "面对陌生人，您的朋友通常会怎么做？",
    "options": [
      {
        "text": "容易与人混熟",
        "letter": "E"
      },
      {
        "text": "比较沉静或矜持",
        "letter": "I"
      }
    ]
  },
  {
    "id": "M03",
    "text": "当TA有空可以外出一整天，TA会怎么做？",
    "options": [
      {
        "text": "提前做计划",
        "letter": "J"
      },
      {
        "text": "说去就去，说走就走",
        "letter": "P"
      }
    ]
  },
  {
    "id": "M04",
    "text": "TA的性格更倾向于哪种？",
    "options": [
      {
        "text": "重视感情多于逻辑",
        "letter": "F"
      },
      {
        "text": "重视逻辑多于感情",
        "letter": "T"
      }
    ]
  },
  {
    "id": "M05",
    "text": "TA会花很多的时间",
    "options": [
      {
        "text": "一个人独处",
        "letter": "I"
      },
      {
        "text": "和别人在一起",
        "letter": "E"
      }
    ]
  },
  {
    "id": "M06",
    "text": "什么样的人会更容易被TA接受？",
    "options": [
      {
        "text": "一个思想敏捷及非常聪颖的人",
        "letter": "N"
      },
      {
        "text": "实事求是，具丰富常识的人",
        "letter": "S"
      }
    ]
  },
  {
    "id": "M07",
    "text": "与很多人在一起，会让您的朋友",
    "options": [
      {
        "text": "活力培增",
        "letter": "E"
      },
      {
        "text": "心力憔悴",
        "letter": "I"
      }
    ]
  },
  {
    "id": "M08",
    "text": "在下列一对词语中，哪一个更符合您对TA的印象？",
    "options": [
      {
        "text": "尊重事实",
        "letter": "S"
      },
      {
        "text": "以我为主",
        "letter": "N"
      }
    ]
  },
  {
    "id": "M09",
    "text": "在下列一对词语中，哪一个更符合您对TA的印象？",
    "options": [
      {
        "text": "不太喜欢计划约束",
        "letter": "P"
      },
      {
        "text": "很多事情都预先准备",
        "letter": "J"
      }
    ]
  },
  {
    "id": "M10",
    "text": "平时生活中，TA更偏向于哪种风格",
    "options": [
      {
        "text": "有条不紊，比较细致",
        "letter": "J"
      },
      {
        "text": "不拘小节，大大咧咧",
        "letter": "P"
      }
    ]
  },
  {
    "id": "M11",
    "text": "TA的朋友多吗？",
    "options": [
      {
        "text": "朋友不多",
        "letter": "I"
      },
      {
        "text": "朋友众多",
        "letter": "E"
      }
    ]
  },
  {
    "id": "M12",
    "text": "TA的风格更倾向于哪种",
    "options": [
      {
        "text": "具分析力",
        "letter": "T"
      },
      {
        "text": "多愁善感",
        "letter": "F"
      }
    ]
  },
  {
    "id": "M13",
    "text": "要做许多人也做的事，TA比较喜欢",
    "options": [
      {
        "text": "按照一般人的方法去做",
        "letter": "S"
      },
      {
        "text": "构想一个自己的想法",
        "letter": "N"
      }
    ]
  },
  {
    "id": "M14",
    "text": "在社交聚会上，会TA",
    "options": [
      {
        "text": "是说话很多的一个",
        "letter": "E"
      },
      {
        "text": "倾向于多听少说",
        "letter": "I"
      }
    ]
  },
  {
    "id": "M15",
    "text": "TA会更喜欢看哪种类型的书？",
    "options": [
      {
        "text": "喜欢奇特或创新的表达方式",
        "letter": "N"
      },
      {
        "text": "喜欢作者直话直说",
        "letter": "S"
      }
    ]
  },
  {
    "id": "M16",
    "text": "TA更愿意与哪一类同事工作？",
    "options": [
      {
        "text": "天性淳良，但常常前后不一的",
        "letter": "F"
      },
      {
        "text": "言词尖锐但永远合乎逻辑的",
        "letter": "T"
      }
    ]
  },
  {
    "id": "M17",
    "text": "朋友来家里吃饭，TA会如何准备？",
    "options": [
      {
        "text": "冰箱里有啥就吃啥",
        "letter": "P"
      },
      {
        "text": "提前拟定菜单，提前准备菜品",
        "letter": "J"
      }
    ]
  },
  {
    "id": "M18",
    "text": "要作决定时，TA的评判标准是什么？",
    "options": [
      {
        "text": "根据事实来衡量",
        "letter": "T"
      },
      {
        "text": "考虑他人的感受和意见",
        "letter": "F"
      }
    ]
  },
  {
    "id": "M19",
    "text": "在相处中，TA更多表现的是哪种面孔？",
    "options": [
      {
        "text": "温暖的，善于安抚别人",
        "letter": "F"
      },
      {
        "text": "充满正义力量，就事论事",
        "letter": "T"
      }
    ]
  },
  {
    "id": "M20",
    "text": "哪种描述更符合TA的行为方式？",
    "options": [
      {
        "text": "追求新鲜事物",
        "letter": "N"
      },
      {
        "text": "关注现有事物",
        "letter": "S"
      }
    ]
  }
] satisfies readonly QuizQuestion[];
export default [...data];
