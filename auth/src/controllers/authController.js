import { COOKIE_OPTIONS } from '../config/authConfig.js';
import { signSessionToken, signPreviewTicket, verifyJwt } from '../services/tokenService.js';
import { syncGoogleUser, findUserById } from '../services/userService.js';
import { isDatabaseConnected } from '../config/database.js';

/**
 * Handles Google OAuth callback redirect.
 */
export async function handleGoogleCallback(req, res) {
  try {
    const user = await syncGoogleUser(req.user);
    const token = signSessionToken(user);

    res.cookie('token', token, COOKIE_OPTIONS);

    if (req.query.format === 'json') {
      return res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        user,
        token,
      });
    }

    const clientUrl = process.env.CLIENT_URL || '/';
    const redirectUrl = new URL(clientUrl, `${req.protocol}://${req.get('host')}`);
    redirectUrl.searchParams.set('auth', 'success');
    redirectUrl.searchParams.set('token', token);

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('OAuth Callback Error:', error.message || error);
    return res.redirect('/?error=oauth_internal_error');
  }
}

/**
 * Returns the currently authenticated user's profile.
 */
export async function getCurrentUser(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user,
    token: req.token,
  });
}

/**
 * Checks session authentication status safely without triggering 401.
 */
export async function getAuthStatus(req, res) {
  try {
    let token = null;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(200).json({
        success: true,
        authenticated: false,
        user: null,
      });
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json({
        success: true,
        authenticated: false,
        user: null,
        message: 'Database connection is currently degraded.',
      });
    }

    const decoded = verifyJwt(token);
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(200).json({
        success: true,
        authenticated: false,
        user: null,
      });
    }

    return res.status(200).json({
      success: true,
      authenticated: true,
      user,
      token,
    });
  } catch {
    return res.status(200).json({
      success: true,
      authenticated: false,
      user: null,
    });
  }
}

/**
 * Issues a short-lived (60s) single-use ticket for external sandbox preview handshake.
 */
export async function createPreviewTicketHandler(req, res) {
  try {
    const { sandboxId } = req.body;
    if (!sandboxId || typeof sandboxId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'sandboxId is required to generate preview ticket.',
      });
    }

    const { ticket } = signPreviewTicket(req.user, sandboxId);

    return res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Clears authentication token cookie and logs out user.
 */
export function logout(req, res) {
  res.clearCookie('token', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });

  return res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
}
