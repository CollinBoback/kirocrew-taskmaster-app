import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev harness: runs Taskmaster Pro WITHOUT a Crew gateway by aliasing
// @kirocrew/app-sdk to a local mock (in-memory config store, scripted
// taskmaster-agent spawn results). `npm run dev` then open
// http://localhost:5174.
export default defineConfig({
  plugins: [react()],
  root: 'dev',
  server: { port: 5174 },
  resolve: {
    alias: {
      '@kirocrew/app-sdk': fileURLToPath(new URL('./dev/mockSdk.tsx', import.meta.url)),
      '@kirocrew/ui': fileURLToPath(new URL('./dev/mockUi.tsx', import.meta.url)),
    },
  },
  build: { outDir: '../dev-dist' },
})
