import process from 'node:process'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const GATEWAY_TARGET =
    env.VITE_GATEWAY_TARGET || env.GATEWAY_TARGET || 'http://localhost'

  const extractSandboxId = (req) => {
    if (req._sandboxId) return req._sandboxId
    if (req.headers && req.headers['x-sandbox-id']) {
      return req.headers['x-sandbox-id']
    }
    const match = (req.originalUrl || req.url)?.match(
      /^\/sandbox-host\/([^/]+)/
    )
    return match ? match[1] : null
  }

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

      proxy: {
        // Gateway API (sandbox start, agent run, auth, etc.)
        '/api': {
          target: GATEWAY_TARGET,
          changeOrigin: true,

          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log(
                '[GATEWAY HTTP]',
                req.method,
                req.url,
                '->',
                proxyReq.getHeader('host')
              )
            })

            proxy.on('error', (err, req) => {
              console.error('[GATEWAY ERROR]', req.url, err.message)
            })
          },
        },

        // Dynamic sandbox agent HTTP + WebSocket proxy
        '/sandbox-host': {
          target: GATEWAY_TARGET,
          changeOrigin: false,
          ws: true,

          rewrite: (path) => path.replace(/^\/sandbox-host\/[^/]+/, ''),

          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const sandboxId = extractSandboxId(req)
              if (sandboxId) {
                proxyReq.setHeader(
                  'host',
                  `sandbox-${sandboxId}.agent.localhost`
                )
              }

              console.log('[SANDBOX HTTP]', {
                method: req.method,
                incoming: req.url,
                host: proxyReq.getHeader('host'),
                path: proxyReq.path,
              })
            })

            proxy.on('proxyReqWs', (proxyReq, req) => {
              const sandboxId = extractSandboxId(req)
              if (sandboxId) {
                proxyReq.setHeader(
                  'host',
                  `sandbox-${sandboxId}.agent.localhost`
                )
              }

              console.log('[SANDBOX WS]', {
                incoming: req.url,
                host: proxyReq.getHeader('host'),
                path: proxyReq.path,
              })
            })

            proxy.on('error', (err, req) => {
              console.error('[SANDBOX PROXY ERROR]', {
                url: req.url,
                message: err.message,
              })
            })
          },
        },
      },
    },
  }
})
