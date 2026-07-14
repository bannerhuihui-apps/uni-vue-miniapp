import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  build: {
    // 生产包压缩 JS，对应微信开发者工具「代码质量 · JS 文件压缩」
    minify: "esbuild",
    target: "es2015",
    cssCodeSplit: true,
  },
});
