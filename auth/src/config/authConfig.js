import crypto from 'crypto';

const isProduction = process.env.NODE_ENV === 'production';
const rawSecret = process.env.JWT_SECRET;

if (isProduction && (!rawSecret || rawSecret === 'agentnexus-default-jwt-secret')) {
  throw new Error(
    '[FATAL SECURITY ERROR] In production, JWT_SECRET environment variable must be set to a cryptographically strong secret!'
  );
}

export const JWT_SECRET = rawSecret || 'agentnexus-default-jwt-secret';

export const JWT_OPTIONS = {
  expiresIn: '7d',
};

export const TICKET_OPTIONS = {
  expiresIn: '60s',
};

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  'http://localhost',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

/**
 * Generates a unique cryptographically secure token/ticket ID (jti).
 */
export function generateJti() {
  return crypto.randomUUID();
}
