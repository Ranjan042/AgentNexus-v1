import { Router } from 'express';
import SandboxModel from '../schema/sandboxModel.js';
import { requireAuth, requireSandboxOwner } from '../middlewares/auth.js';
import { mySandboxes, startSandbox, terminateSandbox, updateSandbox } from '../controller/sandboxController.js';


const router = Router();

router.get('/health', (req, res) => {
  res.status(200).send('Sandbox health is ok :)');
});

/**
 * POST /start
 * Creates a new sandbox in Kubernetes and records ownership details in MongoDB.
 */
router.post('/start', requireAuth, startSandbox);

/**
 * GET /my-sandboxes
 * Lists all active sandboxes owned by the authenticated user.
 */
router.get('/my-sandboxes', requireAuth, mySandboxes);

/**
 * GET /:sandboxId
 * Retrieves details for a specific sandbox, ensuring caller is the owner.
 */
router.get('/:sandboxId', requireAuth, requireSandboxOwner, async (req, res) => {
  // Update last accessed time
  req.sandbox.lastAccessedAt = new Date();
  await req.sandbox.save().catch(() => { });

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
router.delete('/:sandboxId', requireAuth, requireSandboxOwner, terminateSandbox);

/**
 * PATCH /:sandboxId
 * Updates sandbox metadata (e.g., name). Only the owner can make changes.
 */
router.patch('/:sandboxId', requireAuth, requireSandboxOwner, updateSandbox);

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
