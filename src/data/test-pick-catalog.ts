/**
 * 选题首页数据源：日后新增测评只在这里加一项即可。
 */
/** `mbti`：原 MBTI 首页；`*_hub`：同一 MBTI 形首页布局，仅文案与题库不同 */
export type TestPickTarget = "mbti" | "darkness_hub" | "peach_hub" | "crush_hub" | "birth_hub";

export interface TestPickItem {
  id: string;
  title: string;
  subtitle: string;
  /** 有值则可进入对应流程 */
  target?: TestPickTarget;
}

export const testPickCatalog: TestPickItem[] = [
  {
    id: "mbti",
    title: "知我几分 · MBTI",
    subtitle: "性格测试 · 自测与朋友互测",
    target: "mbti",
  },
  {
    id: "darkness_trend",
    title: "黑化趋势测试",
    subtitle: "情境趣味题 · 自测与朋友互测",
    target: "darkness_hub",
  },
  {
    id: "peach_blossom",
    title: "桃花体质测试",
    subtitle: "桃花特质趣味题 · 自测与朋友互测",
    target: "peach_hub",
  },
  {
    id: "crush_index",
    title: "花痴指数测试",
    subtitle: "颜值追星趣味题 · 自测与朋友互测",
    target: "crush_hub",
  },
  {
    id: "birth_color",
    title: "本命颜色测试",
    subtitle: "色彩气质趣味题 · 自测与朋友互测",
    target: "birth_hub",
  },
];
