import { extractToken, verifyToken } from '../services/tokenService.js';
import { verifySandboxOwnership } from '../services/ownershipService.js';
import { getAgentProxy, getPreviewProxy } from '../services/proxyService.js';

/**
 * Attaches protected WebSocket upgrade handler to the HTTP server instance.
 *
 * @param {import('http').Server} server
 */
export function attachWsUpgradeHandler(server) {
  server.on('upgrade', async (request, socket, head) => {
    // Prevent MaxListenersExceededWarning on reused or proxied sockets
    socket.setMaxListeners(30);

    const onSocketError = (err) => {
      console.error('[ROUTER WS SOCKET ERROR]:', err.message);
    };
    socket.once('error', onSocketError);

    const host = request.headers.host?.split(':')[0];
    if (!host?.startsWith('sandbox-')) {
      socket.destroy();
      return;
    }

    const match = host.match(/^sandbox-(.+)\.(preview|agent)\.localhost$/);
    if (!match) {
      console.log('Invalid sandbox host for WebSocket upgrade:', host);
      socket.destroy();
      return;
    }

    const sandboxId = match[1];
    const kind = match[2];

    // 1. Authenticate upgrade request
    const authResult = verifyToken(extractToken(request));
    if (!authResult.valid) {
      console.warn(`[ROUTER WS AUTH REJECTED] ${host}${request.url} - ${authResult.reason}`);
      socket.write(
        'HTTP/1.1 401 Unauthorized\r\n' +
          'Content-Type: text/plain\r\n' +
          'Connection: close\r\n\r\n' +
          `WebSocket Unauthorized: ${authResult.reason}. Authentication required.\n`
      );
      socket.destroy();
      return;
    }

    // 2. Ownership Verification
    const currentUserId = authResult.user.id || authResult.user._id;
    const ownershipCheck = await verifySandboxOwnership(sandboxId, currentUserId);

    if (!ownershipCheck.allowed) {
      console.warn(`[ROUTER WS FORBIDDEN] User ${currentUserId} denied access to sandbox ${sandboxId}: ${ownershipCheck.reason}`);
      socket.write(
        'HTTP/1.1 403 Forbidden\r\n' +
          'Content-Type: text/plain\r\n' +
          'Connection: close\r\n\r\n' +
          `WebSocket Forbidden: ${ownershipCheck.reason}. Only the sandbox owner can connect to terminal.\n`
      );
      socket.destroy();
      return;
    }

    console.log(`[ROUTER WS UPGRADE ACCEPTED] owner:${currentUserId} -> ${kind} sandbox:${sandboxId}`);

    try {
      if (kind === 'agent') {
        const proxy = getAgentProxy(sandboxId);
        return proxy.upgrade(request, socket, head);
      }

      if (kind === 'preview') {
        const proxy = getPreviewProxy(sandboxId);
        return proxy.upgrade(request, socket, head);
      }
    } catch (upgradeErr) {
      console.error('[ROUTER WS UPGRADE FAILED]:', upgradeErr.message);
      socket.destroy();
      return;
    }

    socket.destroy();
  });
}
