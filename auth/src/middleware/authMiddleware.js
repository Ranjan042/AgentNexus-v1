import { verifyJwt } from '../services/tokenService.js';
import { findUserById } from '../services/userService.js';
import { isDatabaseConnected, ensureDatabaseConnected } from '../config/database.js';

/**
 * Middleware to authenticate requests using JWT stored in cookies or Bearer Authorization header.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function requireAuth(req, res, next) {
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
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    const decoded = verifyJwt(token);

    if (!isDatabaseConnected()) {
      const connected = await ensureDatabaseConnected();
      if (!connected) {
        return res.status(503).json({
          success: false,
          message: 'Database service is temporarily unavailable. Please retry.',
        });
      }
    }

    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User no longer exists.',
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or expired token.',
      error: error.message,
    });
  }
}
