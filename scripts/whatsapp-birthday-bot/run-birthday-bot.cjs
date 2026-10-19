/**
 * E/23 Official WhatsApp Birthday Automation Bot
 * 
 * Features:
 * - Automatically executes at 12:00 AM (midnight) in Asia/Colombo timezone
 * - Pulls live member data from Supabase (with fallback to local archive)
 * - Identifies today's celebrants
 * - Generates luxury 1080x1920 commemorative birthday poster (Node canvas)
 * - Renders rich WhatsApp message template
 * - Dispatches via WhatsApp (Green API / Baileys / Webhook / Console Preview)
 * - Prevents duplicate sends on the same day via sent_history.json
 * 
 * Usage:
 *   node run-birthday-bot.cjs --today       (Check and send for today)
 *   node run-birthday-bot.cjs --test        (Simulate test birthday send)
 *   node run-birthday-bot.cjs --daemon      (Run 24/7 scheduler for 12:00 AM)
 *   node run-birthday-bot.cjs --date 10-19  (Check specific date MM-DD)
 */

const fs = require('fs');
const path = require('path');
const { generateBirthdayPoster, getTurningAge } = require('./generatePosterNode.cjs');
const { sendWhatsAppMessage } = require('./sendWhatsApp.cjs');

// Paths
const CONFIG_PATH = path.resolve(__dirname, 'whatsapp-config.json');
const HISTORY_PATH = path.resolve(__dirname, 'sent_history.json');
const OUTPUT_DIR = path.resolve(__dirname, 'output');

/**
 * Loads configuration
 */
function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch (e) {
      console.warn(`[Config] Failed to parse whatsapp-config.json, using defaults:`, e.message);
    }
  }
  return {
    timezone: 'Asia/Colombo',
    triggerTime: '00:00',
    sendPoster: true,
    siteUrl: 'https://site-23.vercel.app',
    provider: 'console',
    targetGroup: { groupId: '120363XXXXXXXXXXXX@g.us' },
    messageTemplate: "🎉🎂 *HAPPY BIRTHDAY {name}!* 🎂🎉\n━━━━━━━━━━━━━━━━━━━━━\n🌟 *Batchmate:* {fullName} ({nickname})\n🎓 *E-Number:* {regNo}\n🎈 *Milestone:* Turning {age} Today!\n🏛️ *Faculty:* {department}\n\n✨ _{quote}_\n\n━━━━━━━━━━━━━━━━━━━━━\n💌 *Wishing you a phenomenal year ahead filled with happiness, good health, and glorious achievements in your engineering journey!*\n\n🎓 *With lots of love & best wishes,*\n*The E/23 Family* ❤️\n🌐 *Portal:* {siteUrl}"
  };
}

/**
 * Loads sent history to prevent duplicates
 */
function loadHistory() {
  if (fs.existsSync(HISTORY_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8'));
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * Saves sent history
 */
function recordSent(dateStr, memberId) {
  const history = loadHistory();
  if (!history[dateStr]) history[dateStr] = [];
  if (!history[dateStr].includes(memberId)) {
    history[dateStr].push(memberId);
  }
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf8');
}

/**
 * Fetches batch members from Supabase (or fallback to originalBatchData)
 */
async function fetchBatchmates() {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://drpjcnanbntscabnocvd.supabase.co';
  const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_bQ7SwKgJ8vj5x5QoprBUaA_JtY-ePUx';

  try {
    console.log(`[Data] Attempting to fetch live members from Supabase...`);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/batchmates?select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        console.log(`[Data] Loaded ${data.length} live members from Supabase.`);
        return data.map(r => ({
          id: r.id,
          regNo: r.reg_no || r.regNo,
          name: r.name,
          nickname: r.nickname || (r.name ? r.name.split(' ').pop() : ''),
          birthday: r.birthday,
          photo: r.photo,
          quote: r.quote,
          department: r.department || 'Faculty of Engineering, University of Peradeniya',
          role: r.role
        }));
      }
    }
  } catch (err) {
    console.warn(`[Data] Could not connect to Supabase: ${err.message}. Using local archive fallback.`);
  }

  // Fallback to local archive
  try {
    const localModule = await import('../../src/data/originalBatchData.js');
    console.log(`[Data] Loaded ${localModule.originalBatchmates.length} members from local pristine archive.`);
    return localModule.originalBatchmates;
  } catch (err) {
    console.error(`[Data] Could not load local batch data:`, err.message);
    return [];
  }
}

/**
 * Gets formatted date string in target timezone (YYYY-MM-DD)
 */
function getTargetDateString(timezone = 'Asia/Colombo') {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(now); // "YYYY-MM-DD"
}

/**
 * Formats WhatsApp message from template
 */
function formatMessage(template, celebrant, config) {
  const age = getTurningAge(celebrant.birthday) || 'another';
  const nickname = celebrant.nickname || celebrant.name || 'Batchmate';
  const defaultQuote = 'Wishing you boundless joy, academic greatness, and unforgettable engineering memories!';
  const quote = celebrant.quote ? `"${celebrant.quote}"` : `"${defaultQuote}"`;

  let text = template;
  text = text.replace(/{name}/g, celebrant.name || nickname);
  text = text.replace(/{fullName}/g, celebrant.name || 'Batchmate');
  text = text.replace(/{nickname}/g, nickname);
  text = text.replace(/{regNo}/g, celebrant.regNo || 'E/23/XXX');
  text = text.replace(/{age}/g, String(age));
  text = text.replace(/{department}/g, celebrant.department || 'Faculty of Engineering, University of Peradeniya');
  text = text.replace(/{quote}/g, quote);
  text = text.replace(/{siteUrl}/g, config.siteUrl || 'https://site-23.vercel.app');

  return text;
}

/**
 * Process birthdays for a specific target date
 */
async function processBirthdaysForDate(targetDateStr, options = {}) {
  const config = loadConfig();
  const history = loadHistory();
  const members = await fetchBatchmates();

  // Extract MM-DD
  const parts = targetDateStr.split('-');
  const targetMonthDay = parts.length === 3 ? `${parts[1]}-${parts[2]}` : targetDateStr;

  console.log(`\n======================================================`);
  console.log(`🔍 Checking birthdays for date: ${targetDateStr} (MM-DD: ${targetMonthDay})`);
  console.log(`Timezone: ${config.timezone || 'Asia/Colombo'}`);
  console.log(`======================================================\n`);

  const celebrants = members.filter(m => {
    if (!m.birthday) return false;
    const bparts = m.birthday.split('-');
    if (bparts.length !== 3) return false;
    const bMonthDay = `${bparts[1]}-${bparts[2]}`;
    return bMonthDay === targetMonthDay;
  });

  if (celebrants.length === 0) {
    console.log(`ℹ️ No birthdays found for ${targetDateStr}.`);
    return { count: 0, celebrants: [] };
  }

  console.log(`🎉 Found ${celebrants.length} celebrant(s) today:`);
  celebrants.forEach((c, idx) => {
    console.log(`  ${idx + 1}. ${c.name} (${c.regNo}) - Birthday: ${c.birthday}`);
  });

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results = [];

  for (const celebrant of celebrants) {
    const alreadySent = history[targetDateStr] && history[targetDateStr].includes(celebrant.id);
    if (alreadySent && !options.force) {
      console.log(`⏭️  Skipping ${celebrant.name} (${celebrant.regNo}): Already sent greeting today.`);
      continue;
    }

    console.log(`\n🎨 Generating commemorative poster for ${celebrant.name}...`);
    const posterPath = path.resolve(OUTPUT_DIR, `birthday_${celebrant.id}_${targetDateStr}.jpg`);

    try {
      await generateBirthdayPoster(celebrant, posterPath);
      console.log(`✅ Poster generated: ${posterPath}`);
    } catch (err) {
      console.warn(`⚠️ Poster generation error: ${err.message}. Proceeding with text-only message.`);
    }

    const messageText = formatMessage(config.messageTemplate, celebrant, config);

    // Send WhatsApp Message
    const sendRes = await sendWhatsAppMessage({
      to: config.targetGroup.groupId,
      text: messageText,
      posterPath: fs.existsSync(posterPath) ? posterPath : null,
      config
    });

    if (sendRes.success && !sendRes.preview) {
      recordSent(targetDateStr, celebrant.id);
      console.log(`💾 Recorded delivery in sent_history.json`);
    }

    results.push({
      celebrant: celebrant.name,
      regNo: celebrant.regNo,
      status: sendRes.success ? 'success' : 'failed',
      preview: sendRes.preview
    });
  }

  return { count: celebrants.length, results };
}

/**
 * Runs a simulated test for preview
 */
async function runTestSimulation() {
  console.log(`\n🧪 RUNNING BIRTHDAY BOT SIMULATION (TEST MODE)`);
  const members = await fetchBatchmates();
  // Find a member with birthday or pick first member
  const sample = members.find(m => m.name && m.birthday) || members[0] || {
    id: 'e23020',
    regNo: 'E/23/020',
    name: 'G. Arunothayan',
    nickname: 'Arun',
    birthday: '2004-01-14',
    department: 'Faculty of Engineering, University of Peradeniya',
    quote: 'Building the official E/23 portal. 4 semesters down at Pera Eng!'
  };

  const config = loadConfig();
  const posterPath = path.resolve(OUTPUT_DIR, `test_poster_${sample.id}.jpg`);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`🎨 Generating test poster for ${sample.name}...`);
  await generateBirthdayPoster(sample, posterPath);

  const messageText = formatMessage(config.messageTemplate, sample, config);

  await sendWhatsAppMessage({
    to: config.targetGroup.groupId,
    text: messageText,
    posterPath,
    config
  });

  console.log(`\n✅ Test simulation finished successfully!`);
  console.log(`🖼️ Check poster output at: ${posterPath}\n`);
}

/**
 * 24/7 Daemon loop that triggers at 12:00 AM every midnight
 */
async function startDaemon() {
  const config = loadConfig();
  const tz = config.timezone || 'Asia/Colombo';
  console.log(`\n🚀 [DAEMON MODE STARTED]`);
  console.log(`⏰ Scheduler active for 12:00:00 AM (${tz} timezone)`);
  console.log(`Target Group: ${config.targetGroup.groupId}`);
  console.log(`Provider: ${config.provider}`);
  console.log(`Keep this process running in background or via PM2 / systemd.`);
  console.log(`Checking system clock every 30 seconds...\n`);

  let lastCheckedDate = null;

  setInterval(async () => {
    const now = new Date();
    const localTimeParts = now.toLocaleTimeString('en-US', {
      timeZone: tz,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }).split(':');

    const hour = parseInt(localTimeParts[0], 10);
    const minute = parseInt(localTimeParts[1], 10);
    const todayStr = getTargetDateString(tz);

    // Trigger at 00:00 (12:00 AM) if we haven't already run today
    if (hour === 0 && minute === 0 && lastCheckedDate !== todayStr) {
      lastCheckedDate = todayStr;
      console.log(`\n🔔 [12:00 AM MIDNIGHT DETECTED] Triggering Birthday Automation for ${todayStr}...`);
      try {
        await processBirthdaysForDate(todayStr);
      } catch (err) {
        console.error(`❌ Error in midnight job:`, err);
      }
    }
  }, 30000); // Check every 30 seconds
}

/**
 * CLI Entry Point
 */
async function main() {
  const args = process.argv.slice(2);
  const config = loadConfig();
  const tz = config.timezone || 'Asia/Colombo';

  if (args.includes('--test')) {
    await runTestSimulation();
    process.exit(0);
  }

  if (args.includes('--daemon')) {
    await startDaemon();
    return; // Keep running
  }

  const dateArgIdx = args.indexOf('--date');
  if (dateArgIdx !== -1 && args[dateArgIdx + 1]) {
    const customDate = args[dateArgIdx + 1];
    await processBirthdaysForDate(customDate, { force: args.includes('--force') });
    process.exit(0);
  }

  // Default: check today's date
  const todayStr = getTargetDateString(tz);
  console.log(`Checking today's date (${todayStr}) in timezone ${tz}...`);
  await processBirthdaysForDate(todayStr, { force: args.includes('--force') });
  process.exit(0);
}

main().catch(err => {
  console.error(`[Fatal Error]`, err);
  process.exit(1);
});
