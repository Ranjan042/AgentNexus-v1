import { extractToken, verifyToken } from '../services/tokenService.js';
import { verifySandboxOwnership } from '../services/ownershipService.js';
import { getAgentProxy, getPreviewProxy } from '../services/proxyService.js';
import { handleSessionHandshake } from '../handlers/sessionHandler.js';
import { renderAuthRequiredPage } from '../views/authTemplates.js';

/**
 * Express middleware to authenticate and route sandbox preview and agent requests.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function sandboxAuthGuard(req, res, next) {
  try {
    const host = req.headers.host?.split(':')[0];

    if (!host?.startsWith('sandbox-')) {
      return next();
    }

    const match = host.match(/^sandbox-(.+)\.(preview|agent)\.localhost$/);
    if (!match) {
      return next();
    }

    const sandboxId = match[1];
    const kind = match[2];

    // Check for SSO handshake endpoint
    const urlPath = req.url?.split('?')[0];
    if (urlPath === '/__session' || urlPath === '/__auth/session') {
      return handleSessionHandshake(req, res, sandboxId);
    }

    // 1. Authenticate Request
    const rawToken = extractToken(req);
    const authResult = verifyToken(rawToken);

    if (!authResult.valid) {
      console.warn(`[ROUTER AUTH REJECTED] ${req.method} ${host}${req.url} - ${authResult.reason}`);

      if (kind === 'preview' && req.headers.accept?.includes('text/html')) {
        return res.status(401).send(renderAuthRequiredPage(authResult.reason));
      }

      return res.status(401).json({
        success: false,
        message: `Sandbox access denied: ${authResult.reason}. Please sign in to AgentNexus.`,
      });
    }

    // 2. Ownership Verification
    const currentUserId = authResult.user.id || authResult.user._id;
    const ownershipCheck = await verifySandboxOwnership(sandboxId, currentUserId);

    if (!ownershipCheck.allowed) {
      console.warn(`[ROUTER FORBIDDEN] User ${currentUserId} denied access to sandbox ${sandboxId}: ${ownershipCheck.reason}`);
      return res.status(403).json({
        success: false,
        message: `Forbidden: ${ownershipCheck.reason}. Only the sandbox owner can make changes or access this sandbox.`,
      });
    }

    req.user = authResult.user;
    req.sandbox = ownershipCheck.sandbox;
    req.rawToken = rawToken;

    if (rawToken) {
      res.cookie('token', rawToken, {
        path: '/',
        sameSite: 'lax',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    console.log(`[ROUTER PROXY ACCEPTED] user:${authResult.user?.email || currentUserId} -> ${kind} sandbox:${sandboxId}`);

    if (kind === 'preview') {
      return getPreviewProxy(sandboxId)(req, res, next);
    }

    if (kind === 'agent') {
      return getAgentProxy(sandboxId)(req, res, next);
    }

    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
