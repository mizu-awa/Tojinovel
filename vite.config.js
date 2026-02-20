import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const isBrowserBuild = process.env.VITE_BUILD_MODE === 'browser';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: isBrowserBuild ? 'dist-browser' : 'dist',
    rollupOptions: {
      input: isBrowserBuild
        ? { main: resolve(__dirname, 'index.html') }
        : {
            main: resolve(__dirname, 'index.html'),
            player: resolve(__dirname, 'player.html'),
          },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
