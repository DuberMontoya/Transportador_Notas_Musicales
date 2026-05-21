import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ command }) => ({
  /** GitHub Pages: https://usuario.github.io/Transportador_Notas_Musicales/ */
  base: command === 'build' ? '/Transportador_Notas_Musicales/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
