import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'  // Changed this line

export default defineConfig({
  base: '/employee-registration/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})