/**
 * 静态图片托管在火山 TOS（与 qy 上传路径一致）。
 * 完整 local → URL 对照见 static-images-manifest.json（共 33 张）。
 *
 * 例：_assets/static-images/question.png
 *  → https://zhiwo.tos-cn-beijing.volces.com/minigame/static/images/question.png
 *
 * 小程序需在公众平台配置 downloadFile 合法域名：zhiwo.tos-cn-beijing.volces.com
 */
import staticImagesManifest from "./static-images-manifest.json";

/** 火山 TOS 公开读前缀（objectKey 根：minigame/static/images/） */
export const REMOTE_IMG_BASE_URL = staticImagesManifest.baseUrl;

/** local 相对路径 → 火山 HTTPS URL（relativePath 相对 _assets/static-images/） */
export function remoteImg(relativePath: string): string {
  const path = relativePath.replace(/^\/+/, "");
  const mapped = staticImagesManifest.files[path as keyof typeof staticImagesManifest.files];
  if (mapped) return mapped;
  return `${REMOTE_IMG_BASE_URL}/${path}`;
}

/** 全站通用 UI 图 */
export const IMG_QUESTION_BG = remoteImg("question.png");
export const IMG_INDEX_BG = remoteImg("index.png");
export const IMG_SETTINGS = remoteImg("settings.png");
export const IMG_QUIZ_AD_01 = remoteImg("image-01.png");
export const IMG_QUIZ_AD_02 = remoteImg("image-02.png");
export const IMG_QR_OTHER = remoteImg("image-other.png");

/** 首页轮播五张选题图 */
export const INDEX_HUB_CAROUSEL_SRC: Record<string, string> = {
  mbti: remoteImg("index/MBTI.jpg"),
  darkness_trend: remoteImg("index/heihua.jpg"),
  peach_blossom: remoteImg("index/taohua.jpg"),
  crush_index: remoteImg("index/huachi.jpg"),
  birth_color: remoteImg("index/benming.jpg"),
};

/** 说明页 · 黑化趋势五档配图 */
export const DARKNESS_INFO_IMAGES = [1, 2, 3, 4, 5].map((n) => remoteImg(`heihua/${n}.jpg`));

/** 说明页 · 花痴指数五档配图 */
export const CRUSH_INFO_IMAGES = [1, 2, 3, 4, 5].map((n) => remoteImg(`huachi/${n}.jpg`));

/** 说明页 · 桃花体质四档配图 */
export const PEACH_INFO_IMAGES = [10, 20, 25, 30].map((n) => remoteImg(`taohua/${n}.jpg`));

/** 说明页 · 本命色彩八档配图（第 3 张为 jpeg） */
export const BIRTH_COLOR_INFO_IMAGES = [
  remoteImg("benming/1.jpg"),
  remoteImg("benming/2.jpg"),
  remoteImg("benming/3.jpeg"),
  remoteImg("benming/4.jpg"),
  remoteImg("benming/5.jpg"),
  remoteImg("benming/6.jpg"),
  remoteImg("benming/7.jpg"),
  remoteImg("benming/8.jpg"),
];

export { staticImagesManifest };
