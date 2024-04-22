import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    define: {
      _global: ({})
    }
  },
  preload: {
    define: {
      _global: ({})
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    define: {
      _global: ({})
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
