# uni-vue-miniapp（Vue3 + Vite + uni-app）

独立于 `zhiwo` 原生小程序的 **Vue 语法** 微信小程序脚手架，按需再对接业务（当前未集成知我）。

## 技术栈

- **Vue 3**（`<script setup>` + TypeScript）
- **Vite 5**
- **uni-app**：一套代码可编 **微信小程序 / H5 / App** 等多端

## 环境

- Node ≥ 16（建议 18+）
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

## 常用命令

```bash
cd uni-vue-miniapp
npm install

# 微信小程序开发（热更新，产物在 dist/dev/mp-weixin）
npm run dev:mp-weixin

# 微信小程序生产构建
npm run build:mp-weixin

# 浏览器 H5（调 UI 方便）
npm run dev:h5

# TS 类型检查
npm run type-check
```

在微信开发者工具中选择 **导入项目**，目录指向：

- 开发：`dist/dev/mp-weixin`
- 打包：`dist/build/mp-weixin`

## 配置小程序 AppID

编辑 `src/manifest.json`：

- `mp-weixin.appid`：填你的测试号 / 正式号（空串仅可部分预览，正式发布需配置）。

## 目录说明

| 路径 | 说明 |
|------|------|
| `src/pages/` | 页面（Vue 单文件组件） |
| `src/pages.json` | 路由、窗口标题、分包等 |
| `src/manifest.json` | 应用与各端（含微信）配置 |
| `src/uni.scss` | 全局 SCSS 变量 |
| `static/` | 静态资源（路径以 `/static/...` 引用） |

## 手机端 UI

- 默认使用 **rpx** 做宽度适配；安全区可用 `env(safe-area-inset-bottom)`。
- 如需组件库，可在 [uni-ui](https://uniapp.dcloud.net.cn/component/uniui/uni-ui.html)、[uView Plus](https://uiadmin.com/uview-plus/) 等中择一通过 `uni_modules` 或 npm 引入（本脚手架未预装，避免锁版本）。

## 与现有 `zhiwo` 关系

- **`zhiwo`**：微信原生写法，与当前目录 **无依赖**。
- 后续若复用接口，建议单独建 `src/api/`、环境变量，勿直接拷业务目录。
