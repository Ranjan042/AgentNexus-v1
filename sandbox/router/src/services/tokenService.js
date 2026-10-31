import crypto from 'crypto';
import { JWT_SECRET } from '../config/authConfig.js';

// Anti-Replay Store: Tracks consumed single-use ticket IDs (jti) with 2-minute TTL
const consumedTickets = new Map();

// Periodic cleanup of expired ticket entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [jti, expiry] of consumedTickets.entries()) {
    if (now >= expiry) {
      consumedTickets.delete(jti);
    }
  }
}, 60_000).unref();

/**
 * Marks a single-use ticket JTI as consumed. Returns false if already consumed (replay attack).
 *
 * @param {string} jti
 * @param {number} [ttlMs=120000]
 * @returns {boolean} True if successfully consumed, False if replayed
 */
export function consumeTicket(jti, ttlMs = 120_000) {
  if (!jti) return true;
  if (consumedTickets.has(jti)) {
    return false;
  }
  consumedTickets.set(jti, Date.now() + ttlMs);
  return true;
}

/**
 * Extracts authentication token from Bearer header, Cookie, Query param, or Referer.
 *
 * @param {import('http').IncomingMessage} req
 * @returns {string|null}
 */
export function extractToken(req) {
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
      const [key, ...rest] = cookie.trim().split('=');
      if (key === 'token' && rest.length > 0) {
        return decodeURIComponent(rest.join('=').trim());
      }
    }
  }

  // 3. Query string: ?token=<jwt> or ?ticket=<jwt>
  if (req.url) {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const queryToken = urlObj.searchParams.get('token') || urlObj.searchParams.get('ticket');
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

  // 5. Referer query parameter fallback (essential for cross-origin asset imports)
  const referer = req.headers['referer'] || req.headers['Referer'];
  if (referer && typeof referer === 'string') {
    try {
      const refererUrl = new URL(referer);
      const refererToken = refererUrl.searchParams.get('token') || refererUrl.searchParams.get('ticket');
      if (refererToken) {
        return refererToken.trim();
      }
    } catch {
      // Ignore referer parsing errors
    }
  }

  return null;
}

/**
 * Validates JWT token using constant-time HMAC-SHA256 signature verification.
 *
 * @param {string|null} token
 * @returns {{ valid: boolean, reason?: string, user?: object, sessionToken?: string }}
 */
export function verifyToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'No authentication token provided' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, reason: 'Malformed token format' };
  }

  try {
    const [headerB64, payloadB64, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
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

    return {
      valid: true,
      user: payload,
      sessionToken: payload.sessionToken,
    };
  } catch (err) {
    return { valid: false, reason: `Token verification error: ${err.message}` };
  }
}
