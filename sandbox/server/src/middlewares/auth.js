import crypto from 'crypto';

function extractAndVerifyToken(req) {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';');
        const tokenCookie = cookies.find((c) => c.trim().startsWith('token='));
        if (tokenCookie) {
            token = tokenCookie.split('=')[1]?.trim();
        }
    } else if (req.query && req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return { valid: false, reason: 'No authentication token provided' };
    }

    const secret = process.env.JWT_SECRET;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return { valid: false, reason: 'Malformed token format' };
        }

        const [headerB64, payloadB64, signature] = parts;
        const expectedSig = crypto
            .createHmac('sha256', secret)
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

        const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
        if (payload.exp && Date.now() >= payload.exp * 1000) {
            return { valid: false, reason: 'Token has expired' };
        }

        return { valid: true, user: payload };
    } catch {
        return { valid: false, reason: 'Token verification failed' };
    }
}

export function requireAuth(req, res, next) {
  const authCheck = extractAndVerifyToken(req);
  if (!authCheck.valid) {
    return res.status(401).json({
      success: false,
      message: `Authentication required: ${authCheck.reason}. Please sign in with Google.`,
    });
  }
  req.user = authCheck.user;
  next();
}

export async function requireSandboxOwner(req, res, next) {
  const sandboxId = req.params.sandboxId || req.body.sandboxId;

  if (!sandboxId) {
    return res.status(400).json({
      success: false,
      message: 'Sandbox ID is required.',
    });
  }

  try {
    const sandbox = await SandboxModel.findOne({ sandboxId });

    if (!sandbox) {
      return res.status(404).json({
        success: false,
        message: `Sandbox ${sandboxId} not found.`,
      });
    }

    // Strict ownership verification: compare authenticated user ID with sandbox creator userId
    const currentUserId = req.user.id || req.user._id;
    if (!sandbox.isOwnedBy(currentUserId)) {
      console.warn(`[UNAUTHORIZED ACCESS ATTEMPT] User ${currentUserId} attempted to modify sandbox ${sandboxId} owned by ${sandbox.userId}`);
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to access or modify this sandbox. Only the owner can make changes.',
      });
    }

    req.sandbox = sandbox;
    next();
  } catch (error) {
    console.error('Ownership verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify sandbox permissions.',
      error: error.message,
    });
  }
}