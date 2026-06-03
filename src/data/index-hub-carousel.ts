import type { SessionQuizId } from "@/state/minigame-app";
import { INDEX_HUB_CAROUSEL_SRC } from "@/config/static-images";

export interface IndexHubCarouselItem {
  quizId: SessionQuizId;
  /** 远程图片 URL */
  src: string;
  /** 首页轮播下方展示文案 */
  label: string;
  /** 对应 CDN index/ 下文件名（不含扩展名） */
  imageKey: string;
}

/** quizId → 展示文案 / 图片文件名 */
const indexHubCarouselMeta: Record<
  SessionQuizId,
  Pick<IndexHubCarouselItem, "label" | "imageKey">
> = {
  mbti: { label: "性格测试", imageKey: "MBTI" },
  darkness_trend: { label: "黑化趋势", imageKey: "heihua" },
  peach_blossom: { label: "桃花体质", imageKey: "taohua" },
  crush_index: { label: "花痴指数", imageKey: "huachi" },
  birth_color: { label: "本命色彩", imageKey: "benming" },
};

/**
 * 首页轮播展示顺序：调整此数组即可改变五张图的先后。
 * 顺序即从左到右 / 切换时的顺序。
 */
export const indexHubCarouselOrder: SessionQuizId[] = [
  "mbti",
  "darkness_trend",
  "peach_blossom",
  "crush_index",
  "birth_color",
];

export const indexHubCarousel: IndexHubCarouselItem[] = indexHubCarouselOrder.map((quizId) => ({
  quizId,
  src: INDEX_HUB_CAROUSEL_SRC[quizId]!,
  ...indexHubCarouselMeta[quizId],
}));

export function getIndexHubCarouselLabel(quizId: SessionQuizId): string {
  return indexHubCarouselMeta[quizId]?.label ?? "性格测试";
}

/** 首页底部说明链接文案（无间隔符，如「黑化趋势说明」） */
export function getIndexHubInfoLinkLabel(quizId: SessionQuizId): string {
  if (quizId === "mbti") return "性格类型说明";
  return `${getIndexHubCarouselLabel(quizId)}说明`;
}
