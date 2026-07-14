/**
 * 与原 zhiwo/app.js 中自定义字体保持一致。
 *
 * 【微信小程序】在 App.vue onLaunch 中调用 uni.loadFontFace；
 * — 远程地址须在小程序后台配置「downloadFile 合法域名」（zhiwojifen.zhidezhipin.com）。
 * — 本地兜底：`src/static/fonts/qingning-rounded.ttf`，并把 USE_REMOTE_FONT 设为 false（会显著增大主包）。
 *
 * 【H5】App.vue 中另有 @font-face；请保持 URL 与本文件 Remote 常量一致。
 */
export const FONT_FAMILY_QINGNING = "QingningRounded";

/** 是否使用线上 CDN（true：remote；false：走 /static/fonts/ 本地） */
export const QINGNING_USE_REMOTE_FONT = true;

export const QINGNING_FONT_URL_REMOTE =
  "https://zhiwojifen.zhidezhipin.com/img/fonts/qingning-rounded.ttf";

/** 将 .ttf 放到 src/static/fonts/ 后可切换为本地，避免域名与白名单依赖 */
export const QINGNING_FONT_URL_LOCAL = "/static/fonts/qingning-rounded.ttf";

/** 微信小程序 loadFontFace 的 url() 参数内使用的裸地址（无引号外层由调用方拼接） */
export function getQingningFontUrlForMp(): string {
  return QINGNING_USE_REMOTE_FONT
    ? QINGNING_FONT_URL_REMOTE
    : QINGNING_FONT_URL_LOCAL;
}
