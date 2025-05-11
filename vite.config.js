import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import React from 'react'
{import('tailwindcss').Config}
// import react from '@vitejs/plugin-react'

// https://vite.dev/config/

export default defineConfig({
 
  plugins: [
    tailwindcss(),],
    autoprefixer: {},
    server: {
    port: 3000,
  },
})
