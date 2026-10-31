import { Router } from 'express';
import passport from '../config/passport.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  handleGoogleCallback,
  getCurrentUser,
  getAuthStatus,
  createPreviewTicketHandler,
  logout,
} from '../controllers/authController.js';

const router = Router();

/**
 * Initiates Google OAuth 2.0 authentication flow.
 */
router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    prompt: 'select_account',
  })
);

/**
 * Handles callback from Google OAuth service.
 */
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/?error=auth_failed',
    session: false,
  }),
  handleGoogleCallback
);

/**
 * Returns the currently authenticated user's profile.
 */
router.get('/auth/me', requireAuth, getCurrentUser);

/**
 * Returns current auth status safely without requiring auth header (safe probe).
 */
router.get('/auth/status', getAuthStatus);

/**
 * Issues a short-lived (60s), single-use ticket for external sandbox preview handshake.
 */
router.post('/auth/preview-ticket', requireAuth, createPreviewTicketHandler);

/**
 * Clears authentication token cookie and logs out user.
 */
router.post('/auth/logout', logout);

export default router;
