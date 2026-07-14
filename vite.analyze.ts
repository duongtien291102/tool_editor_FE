import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { visualizer } from 'rollup-plugin-visualizer'

// Temporary build config for bundle analysis
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'docs/audit/bundle-stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
      title: 'tool_editor_fe Bundle Analysis v0.1.0',
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined, // Keep single bundle for analysis
      }
    }
  }
})
