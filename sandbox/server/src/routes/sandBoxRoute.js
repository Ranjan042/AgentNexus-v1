import crypto from 'crypto';
import { Router } from 'express';
import { v7 as uuid } from 'uuid';
import { createPods, deletePods } from '../kubernetes/pod.js';
import { createService, deleteService } from '../kubernetes/service.js';
import SandboxModel from '../schema/sandboxModel.js';

const router = Router();

/**
 * Validates JWT token from header or cookie using HMAC SHA256 if secret is configured.
 */
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

  const secret = process.env.JWT_SECRET || 'agentnexus-default-jwt-secret';
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

/**
 * Middleware: Enforces that the user is authenticated.
 */
function requireAuth(req, res, next) {
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

/**
 * Middleware: Enforces that only the user who created the sandbox (matching userId) can modify or access it.
 */
async function requireSandboxOwner(req, res, next) {
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

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).send('Sandbox health is ok :)');
});

/**
 * POST /start
 * Creates a new sandbox in Kubernetes and records ownership details in MongoDB.
 */
router.post('/start', requireAuth, async (req, res) => {
  try {
    const sandboxId = uuid();
    const userId = req.user.id || req.user._id;
    const userEmail = req.user.email || 'developer@agentnexus.local';
    const previewUrl = `http://sandbox-${sandboxId}.preview.localhost`;

    console.log(`Starting sandbox ${sandboxId} for user ${userEmail} (${userId})`);

    // 1. Create Pod in Kubernetes
    console.log('Creating Pod...');
    await createPods(sandboxId);
    console.log('Pod creation completed');

    // 2. Create Service in Kubernetes
    console.log('Creating Service...');
    await createService(sandboxId);
    console.log('Service creation completed');

    // 3. Persist Sandbox Record in MongoDB
    let savedSandbox = null;
    try {
      savedSandbox = await SandboxModel.create({
        sandboxId,
        userId,
        userEmail,
        name: req.body?.name || `Sandbox ${sandboxId.slice(0, 8)}`,
        status: 'running',
        previewUrl,
        podName: `sandbox-${sandboxId}-pod`,
        serviceName: `sandbox-${sandboxId}-service`,
        lastAccessedAt: new Date(),
        metadata: {
          clientIp: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });
      console.log(`Sandbox ${sandboxId} record stored in DB for userId: ${userId}`);
    } catch (dbErr) {
      console.error('Failed to save sandbox record to DB:', dbErr.message);
      // We still return sandboxId so user can use provisioned resources, but log error
    }

    return res.status(200).json({
      success: true,
      message: 'Sandbox Environment started successfully',
      sandboxId,
      previewUrl,
      sandbox: savedSandbox,
    });
  } catch (error) {
    console.error('Sandbox start failed:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /my-sandboxes
 * Lists all active sandboxes owned by the authenticated user.
 */
router.get('/my-sandboxes', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const sandboxes = await SandboxModel.find({
      userId,
      status: { $ne: 'terminated' },
    }).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      sandboxes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user sandboxes.',
      error: error.message,
    });
  }
});

/**
 * GET /:sandboxId
 * Retrieves details for a specific sandbox, ensuring caller is the owner.
 */
router.get('/:sandboxId', requireAuth, requireSandboxOwner, async (req, res) => {
  // Update last accessed time
  req.sandbox.lastAccessedAt = new Date();
  await req.sandbox.save().catch(() => {});

  return res.status(200).json({
    success: true,
    sandbox: req.sandbox,
  });
});

/**
 * DELETE /:sandboxId
 * Terminates Kubernetes resources and marks the sandbox as terminated in DB.
 * Only the owner can terminate their sandbox.
 */
router.delete('/:sandboxId', requireAuth, requireSandboxOwner, async (req, res) => {
  const { sandboxId } = req.params;

  try {
    console.log(`User ${req.user.id} requested deletion of sandbox ${sandboxId}`);

    // Delete Kubernetes resources
    await deletePods(sandboxId);
    await deleteService(sandboxId);

    // Update DB status to terminated
    req.sandbox.status = 'terminated';
    await req.sandbox.save();

    console.log(`Sandbox ${sandboxId} terminated successfully.`);

    return res.status(200).json({
      success: true,
      message: `Sandbox ${sandboxId} terminated successfully.`,
    });
  } catch (error) {
    console.error(`Failed to terminate sandbox ${sandboxId}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to terminate sandbox resources.',
      error: error.message,
    });
  }
});

/**
 * PATCH /:sandboxId
 * Updates sandbox metadata (e.g., name). Only the owner can make changes.
 */
router.patch('/:sandboxId', requireAuth, requireSandboxOwner, async (req, res) => {
  try {
    if (req.body.name) {
      req.sandbox.name = req.body.name.trim();
    }
    await req.sandbox.save();

    return res.status(200).json({
      success: true,
      sandbox: req.sandbox,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update sandbox.',
      error: error.message,
    });
  }
});

/**
 * GET /:sandboxId/access
 * Verification endpoint to check if the caller owns the sandbox.
 */
router.get('/:sandboxId/access', requireAuth, async (req, res) => {
  const { sandboxId } = req.params;
  try {
    const sandbox = await SandboxModel.findOne({ sandboxId });
    if (!sandbox) {
      return res.status(404).json({ success: false, allowed: false, message: 'Sandbox not found' });
    }

    const currentUserId = req.user.id || req.user._id;
    const isOwner = sandbox.isOwnedBy(currentUserId);

    return res.status(200).json({
      success: true,
      allowed: isOwner,
      isOwner,
      sandboxId,
      userId: currentUserId,
    });
  } catch (err) {
    return res.status(500).json({ success: false, allowed: false, error: err.message });
  }
});

export default router;
