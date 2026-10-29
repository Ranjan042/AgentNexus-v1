import { Router } from 'express';
import passport from '../config/passport.js';
import UserModel from '../schema/usermodel.js';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

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
  async (req, res) => {
    try {
      const { id, displayName, emails, photos } = req.user;
      const email = emails && emails[0] ? emails[0].value : null;
      const avatar = photos && photos[0] ? photos[0].value : null;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Unable to retrieve email from Google profile.',
        });
      }

      let user = await UserModel.findOne({ email });

      if (!user) {
        user = await UserModel.create({
          googleId: id,
          name: displayName || 'Nexus Developer',
          email,
          avatar,
        });
      } else {
        // Keep profile details up to date
        let updated = false;
        if (!user.googleId && id) {
          user.googleId = id;
          updated = true;
        }
        if (avatar && user.avatar !== avatar) {
          user.avatar = avatar;
          updated = true;
        }
        if (displayName && user.name !== displayName) {
          user.name = displayName;
          updated = true;
        }
        if (updated) {
          await user.save();
        }
      }

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || 'agentnexus-default-jwt-secret',
        { expiresIn: '7d' }
      );

      res.cookie('token', token, COOKIE_OPTIONS);

      // If client requests JSON explicitly, return JSON
      if (req.query.format === 'json') {
        return res.status(200).json({
          success: true,
          message: 'User logged in successfully',
          user,
          token,
        });
      }

      // Browser OAuth callback: redirect back to frontend client with token
      const clientUrl = process.env.CLIENT_URL || '/';
      const redirectUrl = new URL(clientUrl, `${req.protocol}://${req.get('host')}`);
      redirectUrl.searchParams.set('auth', 'success');
      redirectUrl.searchParams.set('token', token);

      return res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('OAuth Callback Error:', error);
      return res.redirect('/?error=oauth_internal_error');
    }
  }
);

/**
 * Returns the currently authenticated user's profile.
 */
router.get('/auth/me', requireAuth, async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

/**
 * Returns current auth status without requiring auth header (safe probe).
 */
router.get('/auth/status', async (req, res) => {
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

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'agentnexus-default-jwt-secret'
    );
    const user = await UserModel.findById(decoded.id).select('-__v');

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
    });
  } catch {
    return res.status(200).json({
      success: true,
      authenticated: false,
      user: null,
    });
  }
});

/**
 * Clears authentication token cookie and logs out user.
 */
router.post('/auth/logout', (req, res) => {
  res.clearCookie('token', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });

  return res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
});

export default router;
