import { defineConfig } from 'cypress'

export default defineConfig({
  allowCypressEnv: false,
  env: {
    offline: process.env.CYPRESS_OFFLINE === 'true',
  },

  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? 'http://localhost:3000',
  },
})
