/**
 * Green API Diagnostics & WhatsApp Group Discovery Tool
 * 
 * Usage:
 *   node test-green-api.cjs                (Check status & list all WhatsApp groups)
 *   node test-green-api.cjs --send "Hello" (Send test text to targetGroup)
 *   node test-green-api.cjs --poster       (Send test birthday poster to targetGroup)
 */

const fs = require('fs');
const path = require('path');
const { sendWhatsAppMessage } = require('./sendWhatsApp.cjs');
const { generateBirthdayPoster } = require('./generatePosterNode.cjs');

const CONFIG_PATH = path.resolve(__dirname, 'whatsapp-config.json');

function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch (e) {
      console.error(`Failed to read whatsapp-config.json:`, e.message);
    }
  }
  return {};
}

async function main() {
  const config = loadConfig();
  const idInstance = process.env.GREEN_API_ID_INSTANCE || (config.greenApi && config.greenApi.idInstance);
  const apiTokenInstance = process.env.GREEN_API_TOKEN_INSTANCE || (config.greenApi && config.greenApi.apiTokenInstance);
  const apiUrl = (config.greenApi && config.greenApi.apiUrl) || 'https://api.green-api.com';
  const targetGroup = process.env.WHATSAPP_GROUP_ID || (config.targetGroup && config.targetGroup.groupId);

  console.log(`\n======================================================`);
  console.log(`🟢 GREEN API CONNECTION & DIAGNOSTICS TOOL`);
  console.log(`======================================================`);

  if (!idInstance || !apiTokenInstance) {
    console.error(`❌ ERROR: idInstance or apiTokenInstance is missing!`);
    console.log(`\nPlease add your Green API credentials to:`);
    console.log(`  scripts/whatsapp-birthday-bot/whatsapp-config.json`);
    console.log(`\nOr set environment variables:`);
    console.log(`  $env:GREEN_API_ID_INSTANCE="your-id"`);
    console.log(`  $env:GREEN_API_TOKEN_INSTANCE="your-token"`);
    process.exit(1);
  }

  console.log(`Instance ID: ${idInstance}`);
  console.log(`API URL: ${apiUrl}`);
  console.log(`Target Group: ${targetGroup || '(Not configured yet)'}`);

  // 1. Check authorization status
  console.log(`\n[1/3] Checking instance status...`);
  try {
    const statusRes = await fetch(`${apiUrl}/waInstance${idInstance}/getStateInstance/${apiTokenInstance}`);
    const statusData = await statusRes.json();
    console.log(`Instance State:`, statusData);

    if (statusData.stateInstance !== 'authorized') {
      console.warn(`\n⚠️ Instance is NOT authorized yet (Current status: ${statusData.stateInstance}).`);
      console.log(`Please scan the QR code in the Green API console using your phone WhatsApp:`);
      console.log(`WhatsApp -> Settings -> Linked Devices -> Link a Device\n`);
      return;
    }

    console.log(`✅ WhatsApp instance is AUTHORIZED & CONNECTED!`);
  } catch (err) {
    console.error(`❌ Could not connect to Green API:`, err.message);
    return;
  }

  // 2. Discover WhatsApp Groups & Chats
  console.log(`\n[2/3] Fetching WhatsApp groups & chats to find your Group ID...`);
  try {
    const chatsRes = await fetch(`${apiUrl}/waInstance${idInstance}/getChats/${apiTokenInstance}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    if (chatsRes.ok) {
      const chats = await chatsRes.json();
      if (Array.isArray(chats)) {
        const groups = chats.filter(c => c.id && c.id.endsWith('@g.us'));
        console.log(`\nFound ${groups.length} WhatsApp Group(s):`);
        console.log(`------------------------------------------------------`);
        groups.forEach((g, idx) => {
          const isSelected = g.id === targetGroup;
          console.log(`${idx + 1}. ${g.name || 'Unnamed Group'}`);
          console.log(`   Group ID: ${g.id} ${isSelected ? '👈 [CURRENTLY SELECTED]' : ''}`);
        });
        console.log(`------------------------------------------------------`);
        console.log(`\n💡 To select your batch group, copy its Group ID and paste it into`);
        console.log(`   scripts/whatsapp-birthday-bot/whatsapp-config.json -> targetGroup.groupId`);
      }
    } else {
      console.log(`(Notice: getChats returned HTTP ${chatsRes.status}. Continuing...)`);
    }
  } catch (err) {
    console.warn(`Could not list chats:`, err.message);
  }

  // 3. Handle optional test send
  const args = process.argv.slice(2);
  if (args.includes('--send')) {
    const textIdx = args.indexOf('--send');
    const customText = args[textIdx + 1] || '🤖 Test message from E/23 WhatsApp Birthday Bot!';
    console.log(`\n[3/3] Sending test text message to ${targetGroup}...`);

    config.provider = 'green-api';
    const res = await sendWhatsAppMessage({
      to: targetGroup,
      text: customText,
      config
    });
    console.log(`Result:`, res);
  } else if (args.includes('--poster')) {
    console.log(`\n[3/3] Generating and sending test birthday poster to ${targetGroup}...`);
    config.provider = 'green-api';
    const testSample = {
      id: 'test_sample',
      regNo: 'E/23/020',
      name: 'E/23 Test Celebrant',
      nickname: 'Engineer',
      birthday: '2004-10-19',
      department: 'Faculty of Engineering, University of Peradeniya',
      quote: 'Testing automated midnight birthday dispatch.'
    };
    const posterPath = path.resolve(__dirname, 'output', 'test_green_api_poster.jpg');
    await generateBirthdayPoster(testSample, posterPath);

    const res = await sendWhatsAppMessage({
      to: targetGroup,
      text: `🎉 *Test Birthday Greeting via Green API*\n\nThis is a verification test from the E/23 Birthday Automation Bot!`,
      posterPath,
      config
    });
    console.log(`Result:`, res);
  } else {
    console.log(`\n[3/3] Ready! To test sending a live message to your group:`);
    console.log(`  node scripts/whatsapp-birthday-bot/test-green-api.cjs --send "Hello E/23!"`);
    console.log(`  node scripts/whatsapp-birthday-bot/test-green-api.cjs --poster\n`);
  }
}

main().catch(err => {
  console.error(`Fatal error:`, err);
  process.exit(1);
});
