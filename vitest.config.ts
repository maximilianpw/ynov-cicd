import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/setupTests.ts'],
    globals: true,
    include: ['src/**/*.test.{js,ts,tsx}'],
    coverage: {
      provider: 'istanbul',
      include: [
        'src/components/RegisteredList.tsx',
        'src/components/RegistrationForm.tsx',
        'src/lib/validators.ts',
        'src/routes/index.tsx',
      ],
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})
