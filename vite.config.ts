import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/breakout-intelligence/',
  plugins: [react(), tailwindcss()],
  assetsInclude: ['**/*.yaml'],
})
