'use strict'
/** 知我几分 MBTI 自测 20 题（由 知我几分-MBTI测试题-20.xlsx sheet1 同步） */

import type { QuizQuestion } from '@/state/minigame-app';

const data = [
  {
    "id": "S01",
    "text": "你认为自己是哪种？",
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
    "id": "S02",
    "text": "面对陌生人，你通常会怎么做？",
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
    "id": "S03",
    "text": "当你有空可以外出一整天，你会怎么做？",
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
    "id": "S04",
    "text": "你倾向",
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
    "id": "S05",
    "text": "你喜欢花很多的时间",
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
    "id": "S06",
    "text": "哪些人会更吸引你？",
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
    "id": "S07",
    "text": "与很多人一起会",
    "options": [
      {
        "text": "令你活力培增",
        "letter": "E"
      },
      {
        "text": "常常令你心力憔悴",
        "letter": "I"
      }
    ]
  },
  {
    "id": "S08",
    "text": "在下列一对词语中，哪一个更合你心意？",
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
    "id": "S09",
    "text": "在下列语句中，哪一个更合你心意？",
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
    "id": "S10",
    "text": "平时生活中，你更偏向于哪种风格",
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
    "id": "S11",
    "text": "你的朋友多吗？",
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
    "id": "S12",
    "text": "你的风格更倾向于哪种",
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
    "id": "S13",
    "text": "要做许多人也做的事，你比较喜欢",
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
    "id": "S14",
    "text": "在社交聚会上，你会",
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
    "id": "S15",
    "text": "为乐趣而阅读时，你会",
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
    "id": "S16",
    "text": "你更愿意与哪一类同事工作？",
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
    "id": "S17",
    "text": "朋友来家里吃饭，你会如何准备？",
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
    "id": "S18",
    "text": "要作决定时，你认为比较重要的是",
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
    "id": "S19",
    "text": "你更喜欢别人眼里的你是哪种风格的？",
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
    "id": "S20",
    "text": "哪种描述更符合你的偏好？",
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
