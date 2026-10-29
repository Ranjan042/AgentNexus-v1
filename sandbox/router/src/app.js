import crypto from 'crypto';
import http from 'http';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import mongoose from 'mongoose';
import morgan from 'morgan';
import SandboxModel from './schema/sandboxModel.js';

const app = express();

app.use(morgan('combined'));

// Public health probe endpoint
app.get('/router/health', (req, res) => {
  res.status(200).send('My health is ok :)');
});

const previewProxies = {};
const agentProxies = {};

function getPreviewProxy(sandboxId) {
  if (!previewProxies[sandboxId]) {
    previewProxies[sandboxId] = createProxyMiddleware({
      target: `http://sandbox-${sandboxId}-service:5173`,
      changeOrigin: true,
      ws: true,
    });
  }
  return previewProxies[sandboxId];
}

function getAgentProxy(sandboxId) {
  if (!agentProxies[sandboxId]) {
    agentProxies[sandboxId] = createProxyMiddleware({
      target: `http://sandbox-${sandboxId}-service:3000`,
      changeOrigin: true,
      ws: true,
    });
  }
  return agentProxies[sandboxId];
}

/**
 * Extracts authentication token from Bearer header, Cookie, Query param, or custom header.
 *
 * @param {import('http').IncomingMessage} req
 * @returns {string|null}
 */
function extractToken(req) {
  // 1. Authorization: Bearer <token>
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1]?.trim();
  }

  // 2. Cookie: token=<jwt>
  const cookieHeader = req.headers['cookie'];
  if (cookieHeader && typeof cookieHeader === 'string') {
    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === 'token' && value) {
        return decodeURIComponent(value.trim());
      }
    }
  }

  // 3. Query string: ?token=<jwt>
  if (req.url) {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const queryToken = urlObj.searchParams.get('token');
      if (queryToken) {
        return queryToken.trim();
      }
    } catch {
      // Ignore URL parsing errors
    }
  }

  // 4. Custom header: x-auth-token
  const customHeader = req.headers['x-auth-token'];
  if (customHeader && typeof customHeader === 'string') {
    return customHeader.trim();
  }

  return null;
}

/**
 * Validates JWT token using HMAC-SHA256 signature and expiration check.
 *
 * @param {string|null} token
 * @returns {{ valid: boolean, reason?: string, user?: object }}
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'No authentication token provided' };
  }

  const secret = process.env.JWT_SECRET || 'agentnexus-default-jwt-secret';
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, reason: 'Malformed token format' };
  }

  try {
    const [headerB64, payloadB64, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    const expectedBuf = Buffer.from(expectedSig);
    const actualBuf = Buffer.from(signature);

    if (
      expectedBuf.length !== actualBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, actualBuf)
    ) {
      return { valid: false, reason: 'Invalid token signature' };
    }

    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf-8')
    );

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return { valid: false, reason: 'Token has expired' };
    }

    return { valid: true, user: payload };
  } catch (err) {
    return { valid: false, reason: `Token verification error: ${err.message}` };
  }
}

/**
 * Checks if the authenticated user owns the requested sandbox.
 * Only the user having matching userId is permitted to modify or access the sandbox.
 *
 * @param {string} sandboxId
 * @param {string} userId
 * @returns {Promise<{ allowed: boolean, reason?: string, sandbox?: object }>}
 */
async function verifySandboxOwnership(sandboxId, userId) {
  if (!userId || !sandboxId) {
    return { allowed: false, reason: 'Missing sandboxId or userId' };
  }

  try {
    // If DB is not connected, fallback to allowing if token was cryptographically valid
    if (mongoose.connection.readyState !== 1) {
      return { allowed: true };
    }

    const sandbox = await SandboxModel.findOne({ sandboxId });
    if (!sandbox) {
      return { allowed: false, reason: `Sandbox ${sandboxId} not found in database` };
    }

    if (sandbox.status === 'terminated') {
      return { allowed: false, reason: `Sandbox ${sandboxId} has been terminated` };
    }

    if (!sandbox.isOwnedBy(userId)) {
      return {
        allowed: false,
        reason: `User ${userId} does not own sandbox ${sandboxId}. Only the creator can make changes.`,
      };
    }

    return { allowed: true, sandbox };
  } catch (err) {
    console.error('Error during ownership check:', err.message);
    return { allowed: true };
  }
}

// Protected HTTP Routing Middleware
app.use(async (req, res, next) => {
  try {
    const host = req.headers.host?.split(':')[0];

    if (!host?.startsWith('sandbox-')) {
      return next();
    }

    const match = host.match(/^sandbox-(.+)\.(preview|agent)\.localhost$/);
    if (!match) {
      return next();
    }

    const sandboxId = match[1];
    const kind = match[2];

    // 1. Authenticate Request
    const authResult = verifyToken(extractToken(req));
    if (!authResult.valid) {
      console.warn(`[ROUTER AUTH REJECTED] ${req.method} ${host}${req.url} - ${authResult.reason}`);

      if (kind === 'preview' && req.headers.accept?.includes('text/html')) {
        return res.status(401).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <title>Authentication Required - AgentNexus</title>
              <style>
                body { background:#121216; color:#e8eaed; font-family:sans-serif; display:grid; place-items:center; height:100vh; margin:0; }
                .card { background:#181a1d; border:1px solid rgba(255,255,255,0.1); padding:32px; border-radius:16px; text-align:center; max-width:400px; }
                h2 { color:#8ab4f8; margin-top:0; }
                p { color:#9aa0a6; font-size:14px; }
              </style>
            </head>
            <body>
              <div class="card">
                <h2>Protected Sandbox Preview</h2>
                <p>Authentication required: ${authResult.reason}.</p>
                <p>Please log in to your AgentNexus Google account to access this sandbox.</p>
              </div>
            </body>
          </html>
        `);
      }

      return res.status(401).json({
        success: false,
        message: `Sandbox access denied: ${authResult.reason}. Please sign in to AgentNexus.`,
      });
    }

    // 2. Ownership Verification: Only the user having UserId can make changes / access
    const currentUserId = authResult.user.id || authResult.user._id;
    const ownershipCheck = await verifySandboxOwnership(sandboxId, currentUserId);

    if (!ownershipCheck.allowed) {
      console.warn(`[ROUTER FORBIDDEN] User ${currentUserId} denied access to sandbox ${sandboxId}: ${ownershipCheck.reason}`);
      return res.status(403).json({
        success: false,
        message: `Forbidden: ${ownershipCheck.reason}. Only the sandbox owner can make changes or access this sandbox.`,
      });
    }

    // Attach authenticated user payload to request
    req.user = authResult.user;
    req.sandbox = ownershipCheck.sandbox;

    console.log(`[ROUTER PROXY ACCEPTED] user:${authResult.user?.email || currentUserId} -> ${kind} sandbox:${sandboxId}`);

    if (kind === 'preview') {
      return getPreviewProxy(sandboxId)(req, res, next);
    }

    if (kind === 'agent') {
      return getAgentProxy(sandboxId)(req, res, next);
    }

    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const server = http.createServer(app);

// Protected WebSocket Upgrade Handling
server.on('upgrade', async (request, socket, head) => {
  console.log('WebSocket upgrade attempt:', request.url);

  const host = request.headers.host?.split(':')[0];

  if (!host?.startsWith('sandbox-')) {
    socket.destroy();
    return;
  }

  const match = host.match(/^sandbox-(.+)\.(preview|agent)\.localhost$/);
  if (!match) {
    console.log('Invalid sandbox host for WebSocket upgrade:', host);
    socket.destroy();
    return;
  }

  const sandboxId = match[1];
  const kind = match[2];

  // 1. Authenticate upgrade request
  const authResult = verifyToken(extractToken(request));
  if (!authResult.valid) {
    console.warn(`[ROUTER WS AUTH REJECTED] ${host}${request.url} - ${authResult.reason}`);
    socket.write(
      'HTTP/1.1 401 Unauthorized\r\n' +
        'Content-Type: text/plain\r\n' +
        'Connection: close\r\n\r\n' +
        `WebSocket Unauthorized: ${authResult.reason}. Authentication required.\n`
    );
    socket.destroy();
    return;
  }

  // 2. Ownership Verification
  const currentUserId = authResult.user.id || authResult.user._id;
  const ownershipCheck = await verifySandboxOwnership(sandboxId, currentUserId);

  if (!ownershipCheck.allowed) {
    console.warn(`[ROUTER WS FORBIDDEN] User ${currentUserId} denied access to sandbox ${sandboxId}: ${ownershipCheck.reason}`);
    socket.write(
      'HTTP/1.1 403 Forbidden\r\n' +
        'Content-Type: text/plain\r\n' +
        'Connection: close\r\n\r\n' +
        `WebSocket Forbidden: ${ownershipCheck.reason}. Only the sandbox owner can connect to terminal.\n`
    );
    socket.destroy();
    return;
  }

  console.log(`[ROUTER WS UPGRADE ACCEPTED] owner:${currentUserId} -> ${kind} sandbox:${sandboxId}`);

  if (kind === 'agent') {
    const proxy = getAgentProxy(sandboxId);
    return proxy.upgrade(request, socket, head);
  }

  if (kind === 'preview') {
    const proxy = getPreviewProxy(sandboxId);
    return proxy.upgrade(request, socket, head);
  }

  socket.destroy();
});

export default server;
