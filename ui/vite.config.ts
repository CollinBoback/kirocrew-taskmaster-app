import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production build for the Crew dashboard host. React, lucide-react, the app
// SDK, and @kirocrew/ui are provided by the host import map — they MUST stay
// external (per kiro.dev/docs/crew/apps/build-first-app + shared-modules.ts).
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/App.tsx',
      formats: ['es'],
      fileName: () => 'index.mjs',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react', /^@kirocrew\//],
    },
  },
})
