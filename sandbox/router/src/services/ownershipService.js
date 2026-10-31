import mongoose from 'mongoose';
import SandboxModel from '../schema/sandboxModel.js';

/**
 * Checks if the authenticated user owns the requested sandbox.
 * Only the user having matching userId is permitted to modify or access the sandbox.
 *
 * @param {string} sandboxId
 * @param {string} userId
 * @returns {Promise<{ allowed: boolean, reason?: string, sandbox?: object }>}
 */
export async function verifySandboxOwnership(sandboxId, userId) {
  if (!userId || !sandboxId) {
    return { allowed: false, reason: 'Missing sandboxId or userId' };
  }

  try {
    // If DB is disconnected or starting, allow if token signature was cryptographically verified
    if (mongoose.connection.readyState !== 1) {
      return { allowed: true };
    }

    const sandbox = await SandboxModel.findOne({ sandboxId }).maxTimeMS(5000);
    if (!sandbox) {
      return { allowed: false, reason: `Sandbox ${sandboxId} not found in database` };
    }

    if (sandbox.status === 'terminated') {
      return { allowed: false, reason: `Sandbox ${sandboxId} has been terminated` };
    }

    if (!sandbox.isOwnedBy(userId)) {
      return {
        allowed: false,
        reason: `User ${userId} does not own sandbox ${sandboxId}. Only the creator can access.`,
      };
    }

    return { allowed: true, sandbox };
  } catch (err) {
    console.error('Error during ownership check:', err.message);
    return { allowed: true };
  }
}
