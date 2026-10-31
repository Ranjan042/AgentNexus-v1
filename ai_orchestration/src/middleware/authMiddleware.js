import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'agentnexus-default-jwt-secret';

/**
 * Extracts authentication token from Bearer Authorization header, Cookie, or request body.
 *
 * @param {import('express').Request} req
 * @returns {string|null}
 */
function extractToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1]?.trim();
  }

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

  if (req.body?.token && typeof req.body.token === 'string') {
    return req.body.token.trim();
  }

  return null;
}

/**
 * Middleware requiring valid user authentication to run AI agents.
 * Verifies JWT signature and expiration using timing-safe comparison.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function requireAgentAuth(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to your AgentNexus account to run the AI agent.',
    });
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Malformed token format.',
    });
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
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Invalid token signature.',
      });
    }

    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf-8')
    );

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Authentication token has expired. Please log in again.',
      });
    }

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: `Unauthorized. Token verification failed: ${err.message}`,
    });
  }
}
