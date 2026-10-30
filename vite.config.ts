/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // The WebGL stack (three, r3f, drei) is only reached through the lazy CrystalScene import,
    // so default splitting keeps it out of the first paint. Its chunk is large by nature.
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Vendor chunks change rarely, so they stay cached across app releases. three, r3f and post
        // are reached only through the lazy CrystalScene import. Rollup pulls a manual chunk's unassigned
        // dependencies into it, so React and Vite's preload/commonjs helpers are pinned to an initial
        // 'vendor' chunk; left loose they land in r3f and the first paint preloads the WebGL stack.
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id) || /preload-helper|commonjsHelpers/.test(id))
            return 'vendor'
          if (id.includes('node_modules/three/')) return 'three'
          if (id.includes('node_modules/postprocessing/') || id.includes('node_modules/@react-three/postprocessing/'))
            return 'post'
          if (id.includes('node_modules/@react-three/') || id.includes('node_modules/three-stdlib/')) return 'r3f'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
