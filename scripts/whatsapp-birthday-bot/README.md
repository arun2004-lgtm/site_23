# 🎂 E/23 Official WhatsApp Birthday Automation Bot

An automated service that checks the E/23 batch database daily at **12:00:00 AM (midnight, Sri Lanka Standard Time `Asia/Colombo`)**, generates a **high-resolution 1080×1920 commemorative birthday poster**, and posts a **customizable formatted birthday wish** directly to your WhatsApp batch group.

---

## 🌟 Key Features

1. **Exact Midnight Delivery**: Runs at 12:00 AM (`Asia/Colombo` / UTC+5:30).
2. **Live Supabase Sync**: Pulls live updated photos, names, quotes, and nicknames directly from your production database (with automatic fallback to the pristine offline archive).
3. **Automated 1080×1920 Luxury Poster**: Uses Node.js canvas (`@napi-rs/canvas`) to create a commemorative celebration poster with the celebrant's profile picture, turning age, E-Number, and campus blessing.
4. **Rich WhatsApp Template**: Emojis, bold styling, quotes, and direct link to the batch portal.
5. **Duplicate Prevention**: Keeps `sent_history.json` so celebrants are never messaged twice on the same day.
6. **Zero-Maintenance Cloud Option**: Runs completely free via **GitHub Actions** without needing your computer to stay on overnight!

---

## 💬 WhatsApp Message Template Preview

```text
🎉🎂 *HAPPY BIRTHDAY A Rajeeth!* 🎂🎉
━━━━━━━━━━━━━━━━━━━━━
🌟 *Batchmate:* A Rajeeth (rajee)
🎓 *E-Number:* E/23/289
🎈 *Milestone:* Turning 22 Today!
🏛️ *Faculty:* Faculty of Engineering, University of Peradeniya

✨ _"Wishing you boundless joy, academic greatness, and unforgettable engineering memories!"_

━━━━━━━━━━━━━━━━━━━━━
💌 *Wishing you a phenomenal year ahead filled with happiness, good health, and glorious achievements in your engineering journey!*

🎓 *With lots of love & best wishes,*
*The E/23 Family* ❤️
🌐 *Portal:* https://site-23.vercel.app
```
*(Plus the attached high-res 1080×1920 poster image!)*

---

## 🚀 Setup Guide

### Step 1: Connect to WhatsApp (3-Minute Free Setup)

We recommend **Green API** because it provides a simple REST API and runs cleanly inside GitHub Actions without managing a browser session:

1. Sign up for a free developer instance at [Green API](https://green-api.com/).
2. In the Green API console, open your instance and scan the QR code using WhatsApp on your phone (**Linked Devices** → **Link a Device**).
3. Copy your:
   - **`idInstance`** (e.g., `110192...`)
   - **`apiTokenInstance`** (e.g., `d8e3b7c...`)
4. Obtain your WhatsApp Group ID (`chatId`):
   - In Green API console, call `GetChats` or look at your group's ID in the console log.
   - Group IDs end with `@g.us` (e.g., `120363294819284712@g.us`).
   - *(Tip: For testing on yourself first, you can use your personal number with country code, e.g. `94771234567@c.us`)*.

---

### Method A: 100% Free Cloud Automation (GitHub Actions) ⭐ RECOMMENDED

**Your laptop does NOT need to be turned on.** GitHub's servers will wake up every midnight at 12:00 AM SLST, render the poster, and post to WhatsApp.

1. Go to your GitHub repository: `https://github.com/arun2004-lgtm/site_23`
2. Navigate to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
3. Add the following 3 secrets:
   - `GREEN_API_ID_INSTANCE`: Your Green API instance ID.
   - `GREEN_API_TOKEN_INSTANCE`: Your Green API token.
   - `WHATSAPP_GROUP_ID`: Your group JID (e.g. `120363XXXXXXXXXX@g.us`).
4. That's it! The workflow at `.github/workflows/whatsapp-birthday-bot.yml` will automatically trigger at `18:30 UTC` (which corresponds to `00:00:00` midnight Sri Lanka Time).
5. You can also manually trigger it anytime by going to **Actions** → **🎂 E/23 WhatsApp Midnight Birthday Bot** → **Run workflow**.

---

### Method B: Local or VPS Runner

If you prefer running it locally on your laptop or on a VPS:

1. Open `scripts/whatsapp-birthday-bot/whatsapp-config.json`.
2. Set:
   ```json
   {
     "provider": "green-api",
     "targetGroup": {
       "groupId": "120363XXXXXXXXXXXX@g.us"
     },
     "greenApi": {
       "idInstance": "YOUR_ID",
       "apiTokenInstance": "YOUR_TOKEN"
     }
   }
   ```
3. Run the 24/7 midnight daemon:
   ```bash
   npm run bot:daemon
   ```
   *(Or keep it running in the background with PM2: `pm2 start scripts/whatsapp-birthday-bot/run-birthday-bot.cjs --name birthday-bot -- --daemon`)*

---

## 🛠️ CLI Commands & Testing

| Command | Description |
| :--- | :--- |
| `npm run bot:today` | Checks today's date in `Asia/Colombo` and dispatches if anyone has a birthday. |
| `npm run bot:test` | Simulates a test birthday run with preview poster and message. |
| `npm run bot:daemon` | Starts the 24/7 background scheduler for 12:00 AM midnight. |
| `node scripts/whatsapp-birthday-bot/run-birthday-bot.cjs --date 10-19` | Checks a custom date (`MM-DD` or `YYYY-MM-DD`). |
| `node scripts/whatsapp-birthday-bot/run-birthday-bot.cjs --today --force` | Re-sends even if already recorded in `sent_history.json`. |

---

## 🎨 Customizing the Message Template

In `scripts/whatsapp-birthday-bot/whatsapp-config.json`, edit `"messageTemplate"`. You can use any of these variables:

| Variable | Replaced With |
| :--- | :--- |
| `{name}` | Celebrant's display name |
| `{fullName}` | Full legal/official name |
| `{nickname}` | Nickname or short name |
| `{regNo}` | E-Number (e.g. `E/23/020`) |
| `{age}` | Turning age calculated from birth year |
| `{department}` | Faculty / Department name |
| `{quote}` | Celebrant's personal quote or default wish |
| `{siteUrl}` | Portal website link |
