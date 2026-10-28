import process from 'node:process'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const isK8s = Boolean(process.env.KUBERNETES_SERVICE_HOST)

  const ROUTER_TARGET =
    process.env.ROUTER_TARGET ||
    env.VITE_ROUTER_TARGET ||
    (isK8s ? 'http://router-service:80' : 'http://localhost')

  const GATEWAY_TARGET =
    process.env.GATEWAY_TARGET ||
    env.VITE_GATEWAY_TARGET ||
    'http://localhost'

  return {
    plugins: [
      {
        name: 'sandbox-proxy-helper',
        configureServer(server) {
          // Capture sandboxId for HTTP requests before Vite proxy rewrite mutates req.url
          server.middlewares.use((req, res, next) => {
            const match = req.url?.match(/^\/sandbox-host\/([^/]+)/)
            if (match) {
              req._sandboxId = match[1]
            }
            next()
          })

          // Capture sandboxId for WebSocket upgrade requests before Vite proxy upgrade listener
          server.httpServer?.prependListener('upgrade', (req) => {
            const match = req.url?.match(/^\/sandbox-host\/([^/]+)/)
            if (match) {
              req._sandboxId = match[1]
            }
          })
        },
      },
      react(),
      tailwindcss(),
    ],

    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      allowedHosts: true,

      proxy: {
        // Gateway APIs
        '/api/sandbox': {
          target: isK8s ? 'http://sandbox-service:80' : GATEWAY_TARGET,
          changeOrigin: true,
        },
        '/api/agents': {
          target: isK8s ? 'http://agents-service:80' : GATEWAY_TARGET,
          changeOrigin: true,
        },
        '/api/auth': {
          target: isK8s ? 'http://auth-service:80' : GATEWAY_TARGET,
          changeOrigin: true,
        },
        '/api': {
          target: GATEWAY_TARGET,
          changeOrigin: true,
        },

        // Dynamic sandbox agent HTTP + WebSocket proxy
        '/sandbox-host': {
          target: ROUTER_TARGET,
          changeOrigin: false,
          ws: true,

          rewrite: (path) => path.replace(/^\/sandbox-host\/[^/]+/, ''),

          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const sandboxId =
                req._sandboxId ||
                req.headers?.['x-sandbox-id'] ||
                (req.originalUrl || req.url)?.match(/^\/sandbox-host\/([^/]+)/)?.[1]

              if (sandboxId) {
                proxyReq.setHeader(
                  'host',
                  `sandbox-${sandboxId}.agent.localhost`
                )
              }
            })

            proxy.on('proxyReqWs', (proxyReq, req) => {
              const sandboxId =
                req._sandboxId ||
                req.headers?.['x-sandbox-id'] ||
                (req.originalUrl || req.url)?.match(/^\/sandbox-host\/([^/]+)/)?.[1]

              if (sandboxId) {
                proxyReq.setHeader(
                  'host',
                  `sandbox-${sandboxId}.agent.localhost`
                )
              }
            })

            proxy.on('error', (err, req) => {
              console.error('[SANDBOX PROXY ERROR]', {
                url: req?.url,
                message: err?.message,
              })
            })
          },
        },
      },
    },
  }
})
