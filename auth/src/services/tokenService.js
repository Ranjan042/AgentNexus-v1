import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_OPTIONS, TICKET_OPTIONS, generateJti } from '../config/authConfig.js';

/**
 * Signs a standard session JWT token for an authenticated user.
 *
 * @param {{ _id: string, email: string }} user
 * @returns {string}
 */
export function signSessionToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      jti: generateJti(),
    },
    JWT_SECRET,
    JWT_OPTIONS
  );
}

/**
 * Signs a short-lived (60s), single-use preview ticket bound to a specific sandbox.
 *
 * @param {{ _id: string, email: string }} user
 * @param {string} sandboxId
 * @returns {{ ticket: string, jti: string }}
 */
export function signPreviewTicket(user, sandboxId) {
  const sessionToken = signSessionToken(user);
  const jti = generateJti();

  const ticket = jwt.sign(
    {
      id: user._id,
      email: user.email,
      sandboxId,
      type: 'preview_ticket',
      sessionToken,
      jti,
    },
    JWT_SECRET,
    TICKET_OPTIONS
  );

  return { ticket, jti };
}

/**
 * Verifies a JWT token or ticket.
 *
 * @param {string} token
 * @returns {object}
 */
export function verifyJwt(token) {
  return jwt.verify(token, JWT_SECRET);
}
