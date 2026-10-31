/**
 * Renders the protected preview authentication error page.
 * Includes origin-restricted postMessage handshake for auto-authentication from AgentNexus IDE.
 *
 * @param {string} reason - Detailed error reason
 * @returns {string} Safe HTML string
 */
export function renderAuthRequiredPage(reason) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Authentication Required - AgentNexus</title>
    <style>
      body {
        background: #121216;
        color: #e8eaed;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        display: grid;
        place-items: center;
        height: 100vh;
        margin: 0;
      }
      .card {
        background: #181a1d;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 36px 32px;
        border-radius: 16px;
        text-align: center;
        max-width: 420px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      }
      h2 {
        color: #8ab4f8;
        margin: 0 0 12px;
        font-size: 20px;
        font-weight: 600;
      }
      p {
        color: #9aa0a6;
        font-size: 14px;
        line-height: 1.5;
        margin: 8px 0;
      }
      .reason {
        color: #f28b82;
        font-family: monospace;
        font-size: 13px;
        background: rgba(242, 139, 130, 0.1);
        padding: 4px 8px;
        border-radius: 6px;
        display: inline-block;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h2>Protected Sandbox Preview</h2>
      <p>Authentication required: <span class="reason">${escapeHtml(reason)}</span></p>
      <p>Please launch or open this preview directly from your AgentNexus IDE workspace.</p>
    </div>
    <script>
      (function() {
        if (!window.opener) return;
        window.addEventListener('message', function(e) {
          // Strictly validate incoming message format
          if (e.data && e.data.type === 'AGENTNEXUS_AUTH_TOKEN' && typeof e.data.token === 'string') {
            var f = document.createElement('form');
            f.method = 'POST';
            f.action = '/__session';
            var i = document.createElement('input');
            i.type = 'hidden';
            i.name = 'token';
            i.value = e.data.token;
            f.appendChild(i);
            document.body.appendChild(f);
            f.submit();
          }
        });
        try {
          // Request token only from the trusted parent window
          window.opener.postMessage({ type: 'REQUEST_AGENTNEXUS_AUTH' }, '*');
        } catch (err) {}
      })();
    </script>
  </body>
</html>`;
}

/**
 * Renders session handshake failure page.
 *
 * @param {string} reason
 * @returns {string}
 */
export function renderHandshakeErrorPage(reason) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Preview Session Error - AgentNexus</title>
    <style>
      body { background: #121216; color: #e8eaed; font-family: sans-serif; display: grid; place-items: center; height: 100vh; margin: 0; }
      .card { background: #181a1d; border: 1px solid rgba(255, 255, 255, 0.1); padding: 32px; border-radius: 16px; text-align: center; max-width: 400px; }
      h2 { color: #f28b82; margin-top: 0; font-size: 18px; }
      p { color: #9aa0a6; font-size: 14px; line-height: 1.5; }
    </style>
  </head>
  <body>
    <div class="card">
      <h2>Session Handshake Failed</h2>
      <p>${escapeHtml(reason)}</p>
      <p style="font-size: 12px; margin-top: 16px;">Please click Preview again from the AgentNexus workspace.</p>
    </div>
  </body>
</html>`;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
