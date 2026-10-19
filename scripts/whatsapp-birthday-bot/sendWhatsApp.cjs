/**
 * WhatsApp Delivery Service
 * Supports:
 * 1. Green API (Cloud API - Zero server setup, works with GitHub Actions)
 * 2. Custom Webhook / UltraMsg
 * 3. Baileys (Local WhatsApp Web socket)
 * 4. Console (Preview mode for testing)
 */

const fs = require('fs');
const path = require('path');

/**
 * Sends WhatsApp birthday message (and optional poster image) to group
 * @param {Object} options
 * @param {string} options.to - Target WhatsApp Group JID (e.g. 120363xxxxxx@g.us)
 * @param {string} options.text - Formatted WhatsApp message caption
 * @param {string} [options.posterPath] - Filepath of the generated 1080x1920 poster JPEG
 * @param {Object} options.config - Config loaded from whatsapp-config.json
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
async function sendWhatsAppMessage({ to, text, posterPath, config }) {
  const provider = (config.provider || 'console').toLowerCase();

  // Allow environment variables to override config
  const targetGroup = process.env.WHATSAPP_GROUP_ID || to || (config.targetGroup && config.targetGroup.groupId);

  console.log(`\n======================================================`);
  console.log(`[WhatsApp Sender] Preparing dispatch via: ${provider.toUpperCase()}`);
  console.log(`[WhatsApp Sender] Target Group: ${targetGroup}`);
  console.log(`======================================================`);

  if (!targetGroup || targetGroup.includes('XXXXXXXXXXXX')) {
    if (provider !== 'console') {
      console.warn(`[WhatsApp Sender] WARNING: Target group ID is not configured! Defaulting to console preview mode.`);
      return sendConsolePreview({ to: targetGroup, text, posterPath });
    }
  }

  switch (provider) {
    case 'green-api':
      return sendViaGreenApi({
        to: targetGroup,
        text,
        posterPath,
        config: config.greenApi || {}
      });

    case 'webhook':
      return sendViaWebhook({
        to: targetGroup,
        text,
        posterPath,
        config: config.webhook || {}
      });

    case 'baileys':
      return sendViaBaileys({
        to: targetGroup,
        text,
        posterPath,
        config: config.baileys || {}
      });

    case 'console':
    default:
      return sendConsolePreview({ to: targetGroup, text, posterPath });
  }
}

/**
 * Sends image + caption via Green API (Cloud REST API)
 */
async function sendViaGreenApi({ to, text, posterPath, config }) {
  const idInstance = process.env.GREEN_API_ID_INSTANCE || config.idInstance;
  const apiTokenInstance = process.env.GREEN_API_TOKEN_INSTANCE || config.apiTokenInstance;
  const apiUrl = config.apiUrl || 'https://api.green-api.com';

  if (!idInstance || !apiTokenInstance) {
    console.error(`[Green API] Error: 'idInstance' or 'apiTokenInstance' missing!`);
    console.log(`Set them in 'whatsapp-config.json' or via environment variables.`);
    return sendConsolePreview({ to, text, posterPath, note: 'Failed due to missing Green API credentials' });
  }

  try {
    if (posterPath && fs.existsSync(posterPath)) {
      console.log(`[Green API] Uploading & sending poster: ${posterPath}`);
      const endpoint = `${apiUrl}/waInstance${idInstance}/sendFileByUpload/${apiTokenInstance}`;

      const fileBuffer = fs.readFileSync(posterPath);
      const blob = new Blob([fileBuffer], { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('chatId', to);
      formData.append('caption', text);
      formData.append('fileName', path.basename(posterPath));
      formData.append('file', blob, path.basename(posterPath));

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }

      console.log(`[Green API] Poster & birthday message successfully sent to group! Message ID:`, data.idMessage);
      return { success: true, messageId: data.idMessage };
    } else {
      // Send text-only
      console.log(`[Green API] Sending text-only message...`);
      const endpoint = `${apiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: to,
          message: text
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }

      console.log(`[Green API] Birthday message text successfully sent to group! Message ID:`, data.idMessage);
      return { success: true, messageId: data.idMessage };
    }
  } catch (err) {
    console.error(`[Green API] Failed to send:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sends via generic Webhook / UltraMsg
 */
async function sendViaWebhook({ to, text, posterPath, config }) {
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL || config.url;
  if (!webhookUrl) {
    console.error(`[Webhook] Error: Webhook URL is not configured!`);
    return sendConsolePreview({ to, text, posterPath });
  }

  try {
    let payload = {
      to,
      message: text,
      timestamp: new Date().toISOString()
    };

    if (posterPath && fs.existsSync(posterPath)) {
      const b64 = fs.readFileSync(posterPath).toString('base64');
      payload.image = `data:image/jpeg;base64,${b64}`;
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers || {})
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(`[Webhook] Dispatch completed with HTTP ${res.status}`);
    return { success: true };
  } catch (err) {
    console.error(`[Webhook] Delivery failed:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sends via Baileys (direct local WhatsApp Web socket)
 */
async function sendViaBaileys({ to, text, posterPath, config }) {
  let makeWASocket, loadMultiFileAuthState, DisconnectReason;
  try {
    const baileys = require('@whiskeysockets/baileys');
    makeWASocket = baileys.default || baileys.makeWASocket;
    loadMultiFileAuthState = baileys.useMultiFileAuthState;
    DisconnectReason = baileys.DisconnectReason;
  } catch {
    console.warn(`\n[Baileys] Notice: '@whiskeysockets/baileys' is not installed.`);
    console.log(`To use Baileys, install it via: npm i @whiskeysockets/baileys qrcode-terminal`);
    return sendConsolePreview({ to, text, posterPath, note: 'Baileys not installed, printed preview instead' });
  }

  return new Promise((resolve) => {
    (async () => {
      try {
        const authDir = path.resolve(__dirname, config.authFolder || 'auth_info_baileys');
        const { state, saveCreds } = await loadMultiFileAuthState(authDir);

      const sock = makeWASocket({
        auth: state,
        printQRInTerminal: config.printQRInTerminal !== false
      });

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && config.printQRInTerminal !== false) {
          try {
            const qrcode = require('qrcode-terminal');
            qrcode.generate(qr, { small: true });
          } catch {
            console.log(`[Baileys] QR code ready. Please install 'qrcode-terminal' to view in CLI.`);
          }
        }

        if (connection === 'open') {
          console.log(`[Baileys] WhatsApp connected successfully! Sending to ${to}...`);

          try {
            if (posterPath && fs.existsSync(posterPath)) {
              const buffer = fs.readFileSync(posterPath);
              await sock.sendMessage(to, {
                image: buffer,
                caption: text
              });
            } else {
              await sock.sendMessage(to, { text });
            }

            console.log(`[Baileys] Message sent to group successfully!`);
            // Clean disconnect after sending
            setTimeout(() => {
              sock.end();
              resolve({ success: true });
            }, 3000);
          } catch (sendErr) {
            console.error(`[Baileys] Error sending message:`, sendErr.message);
            resolve({ success: false, error: sendErr.message });
          }
        }

        if (connection === 'close') {
          const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason?.loggedOut;
          if (!shouldReconnect) {
            console.log(`[Baileys] Connection logged out.`);
            resolve({ success: false, error: 'Logged out' });
          }
        }
      });
      } catch (err) {
        console.error(`[Baileys] Exception:`, err.message);
        resolve({ success: false, error: err.message });
      }
    })();
  });
}

/**
 * Preview / Console mode for immediate testing
 */
function sendConsolePreview({ to, text, posterPath, note = null }) {
  console.log(`\n------------------------------------------------------`);
  console.log(`📱 [WHATSAPP PREVIEW (CONSOLE MODE)]`);
  if (note) console.log(`📌 Note: ${note}`);
  console.log(`👥 Target Group: ${to || '(Not specified)'}`);
  if (posterPath) {
    console.log(`🖼️ Attached Poster: ${posterPath} (${fs.existsSync(posterPath) ? 'Ready on disk' : 'Missing'})`);
  }
  console.log(`\n💬 MESSAGE CONTENT:\n`);
  console.log(text);
  console.log(`\n------------------------------------------------------\n`);
  return { success: true, preview: true };
}

module.exports = {
  sendWhatsAppMessage
};
