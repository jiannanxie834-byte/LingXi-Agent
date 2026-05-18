import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url' // 🌟 引入 Node 的 URL 解析模块

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 🌟 核心魔法：告诉 Vite，碰到 @ 就把它替换成 src 目录的绝对路径
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})