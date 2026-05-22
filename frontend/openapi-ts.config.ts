import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: './openapi.yml',
  output: './src/shared/api',
  plugins: ['@hey-api/client-fetch'],
})
