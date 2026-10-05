import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { InlineConfig } from 'vitest'

const config: UserConfig & { test: InlineConfig } = {
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
}

export default defineConfig(config)
