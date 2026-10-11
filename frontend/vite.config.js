
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: '0.0.0.0',
    port: 5173,

    proxy: {
      '/api/sandbox': {
        target: 'http://localhost',
        changeOrigin: true,
      },

      '/api/agents': {
        target: 'http://localhost',
        changeOrigin: true,
      },


      '^/sandbox-host/[^/]+': {
        target: 'http://sandbox-01a128b9-7914-779d-941a-19eecb008bb0.agent.localhost',
        changeOrigin: true,
        ws: true,

        rewrite: (path) =>
          path.replace(/^\/sandbox-host\/[^/]+/, ''),

        configure: (proxy) => {
          proxy.on('error', (err, req) => {
            console.error('Proxy error:', req?.url, err.message)
          })

          proxy.on('proxyReqWs', (_proxyReq, req) => {
            console.log('Forwarding WebSocket:', req.url)
          })
        },
      },

    },
  },
})
