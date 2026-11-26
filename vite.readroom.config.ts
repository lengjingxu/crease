import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { fileURLToPath, URL } from "node:url";

// 报匣快应用包：平台不接受页面打开后再加载分包，所以每个页面单独构建一次，
// 脚本、样式、字体与图片全部内联进同一个 HTML。首个页面清空输出目录。
const page = process.env.READROOM_PAGE || "index.html";
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: { outDir: "dist-readroom", emptyOutDir: !process.env.READROOM_PAGE, rollupOptions: { input: page } },
});
