const isProduction = process.env.NODE_ENV === 'production';
const rawSecret = process.env.JWT_SECRET;

if (isProduction && (!rawSecret || rawSecret === 'agentnexus-default-jwt-secret')) {
  throw new Error(
    '[FATAL SECURITY ERROR] In production, JWT_SECRET environment variable must be set to a cryptographically strong secret!'
  );
}

export const JWT_SECRET = rawSecret || 'agentnexus-default-jwt-secret';

export const COOKIE_NAME = 'token';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export const ALLOWED_ORIGIN_PATTERNS = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^http:\/\/sandbox-[a-zA-Z0-9-]+\.(preview|agent)\.localhost(:\d+)?$/,
];

/**
 * Checks whether a given origin string is authorized for session initialization.
 *
 * @param {string|undefined} origin
 * @returns {boolean}
 */
export function isAllowedOrigin(origin) {
  if (!origin) return true; // Direct browser navigations might omit Origin header
  try {
    const originUrl = new URL(origin).origin;
    return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(originUrl));
  } catch {
    return false;
  }
}
