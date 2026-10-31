import { createProxyMiddleware } from 'http-proxy-middleware';
import { extractToken } from './tokenService.js';

const previewProxies = {};
const agentProxies = {};

/**
 * Attaches authentication cookie to downstream proxy response headers.
 */
function attachSessionCookie(proxyRes, req) {
  const rawToken = req.rawToken || extractToken(req);
  if (rawToken) {
    const cookieStr = `token=${encodeURIComponent(rawToken)}; Path=/; SameSite=Lax; Max-Age=604800; HttpOnly`;
    const existing = proxyRes.headers['set-cookie'];
    if (Array.isArray(existing)) {
      proxyRes.headers['set-cookie'] = [...existing, cookieStr];
    } else if (existing) {
      proxyRes.headers['set-cookie'] = [existing, cookieStr];
    } else {
      proxyRes.headers['set-cookie'] = [cookieStr];
    }
  }
}

/**
 * Returns proxy instance for sandbox preview (Vite dev server on port 5173).
 *
 * @param {string} sandboxId
 */
export function getPreviewProxy(sandboxId) {
  if (!previewProxies[sandboxId]) {
    previewProxies[sandboxId] = createProxyMiddleware({
      target: `http://sandbox-${sandboxId}-service:5173`,
      changeOrigin: true,
      ws: false,
      on: {
        proxyRes: (proxyRes, req) => {
          attachSessionCookie(proxyRes, req);
        },
        error: (err, req, res) => {
          console.error(`[ROUTER PREVIEW PROXY ERROR] sandbox:${sandboxId}:`, err.message);
          if (res && res.writeHead && !res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: `Preview unavailable: ${err.message}` }));
          }
        },
      },
    });
  }
  return previewProxies[sandboxId];
}

/**
 * Returns proxy instance for sandbox agent backend service (port 3000).
 *
 * @param {string} sandboxId
 */
export function getAgentProxy(sandboxId) {
  if (!agentProxies[sandboxId]) {
    agentProxies[sandboxId] = createProxyMiddleware({
      target: `http://sandbox-${sandboxId}-service:3000`,
      changeOrigin: true,
      ws: false,
      on: {
        proxyRes: (proxyRes, req) => {
          attachSessionCookie(proxyRes, req);
        },
        error: (err, req, res) => {
          console.error(`[ROUTER AGENT PROXY ERROR] sandbox:${sandboxId}:`, err.message);
          if (res && res.writeHead && !res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: `Agent service unavailable: ${err.message}` }));
          }
        },
      },
    });
  }
  return agentProxies[sandboxId];
}
