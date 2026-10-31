import { isAllowedOrigin } from '../config/authConfig.js';
import { extractToken, verifyToken, consumeTicket } from '../services/tokenService.js';
import { verifySandboxOwnership } from '../services/ownershipService.js';
import { renderHandshakeErrorPage } from '../views/authTemplates.js';

/**
 * Safely parses request body for POST session handshake without interfering with streaming proxies.
 *
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<Record<string, string>>}
 */
export function parseRequestBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      try {
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          resolve(JSON.parse(data));
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          const params = new URLSearchParams(data);
          const obj = {};
          for (const [k, v] of params.entries()) {
            obj[k] = v;
          }
          resolve(obj);
        } else {
          resolve({});
        }
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

/**
 * Handles /__session and /__auth/session SSO ticket / token exchange.
 * Sets HttpOnly cookie and performs 303 redirect to '/' with zero tokens in URL.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string} sandboxId
 */
export async function handleSessionHandshake(req, res, sandboxId) {
  // 1. Origin / Referer Validation (Anti-CSRF)
  const origin = req.headers['origin'] || req.headers['referer'];
  if (!isAllowedOrigin(origin)) {
    console.warn(`[ROUTER CSRF BLOCKED] Unauthorized origin for session handshake: ${origin}`);
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Cross-site session handshake request from untrusted origin.',
    });
  }

  // 2. Parse request body if method is POST
  let bodyData = {};
  if (req.method === 'POST') {
    bodyData = await parseRequestBody(req);
  }

  const rawToken = bodyData.token || bodyData.ticket || extractToken(req);
  const authResult = verifyToken(rawToken);

  if (!authResult.valid) {
    console.warn(`[ROUTER SESSION REJECTED] ${req.headers.host}${req.url} - ${authResult.reason}`);
    return res.status(401).send(renderHandshakeErrorPage(authResult.reason));
  }

  // 3. Anti-Replay Check for Single-Use Tickets
  if (authResult.user?.type === 'preview_ticket' && authResult.user?.jti) {
    const isFirstUse = consumeTicket(authResult.user.jti);
    if (!isFirstUse) {
      console.warn(`[ROUTER TICKET REPLAY DETECTED] JTI: ${authResult.user.jti}`);
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Preview ticket has already been used and cannot be replayed.',
      });
    }
  }

  // 4. Verify ticket sandbox scope
  if (authResult.user?.type === 'preview_ticket' && authResult.user?.sandboxId) {
    if (authResult.user.sandboxId !== sandboxId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Ticket is not authorized for this sandbox.',
      });
    }
  }

  // 5. Ownership Verification
  const currentUserId = authResult.user.id || authResult.user._id;
  const ownershipCheck = await verifySandboxOwnership(sandboxId, currentUserId);
  if (!ownershipCheck.allowed) {
    return res.status(403).json({
      success: false,
      message: `Forbidden: ${ownershipCheck.reason}`,
    });
  }

  // 6. Set HttpOnly Cookie & Redirect (303 converts POST to clean GET /)
  const cookieToken = authResult.sessionToken || rawToken;
  res.setHeader(
    'Set-Cookie',
    `token=${encodeURIComponent(cookieToken)}; Path=/; SameSite=Lax; Max-Age=604800; HttpOnly`
  );

  console.log(`[ROUTER SESSION HANDSHAKE SUCCESS] user:${authResult.user?.email || currentUserId} -> sandbox:${sandboxId}`);
  return res.redirect(303, '/');
}
