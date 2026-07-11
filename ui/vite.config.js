import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 相对路径构建，适配 Worker Assets 部署
  base: './',
  build: {
    outDir: 'dist',
  },
});
