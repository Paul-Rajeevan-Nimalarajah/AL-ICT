const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// --- Configuration ---
const bot = new Telegraf(process.env.BOT_TOKEN);
const websiteUrl = process.env.WEBSITE_URL || 'https://alict.paulrajeevan.com';
const USERS_FILE = path.join(__dirname, 'users.json');

// --- Helper Functions ---

// 1. User Tracking (Note: Ephemeral on Vercel)
const saveUser = (ctx) => {
  try {
    const userId = ctx.from.id;
    let users = [];
    if (fs.existsSync(USERS_FILE)) {
      users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
    if (!users.includes(userId)) {
      users.push(userId);
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    }
  } catch (e) {
    console.error('Error tracking user:', e.message);
  }
};

// 2. Data Loader
const getMaterials = async () => {
  let data;
  const localPath = path.join(__dirname, '../website/data/materials.json');
  if (fs.existsSync(localPath)) {
    data = JSON.parse(fs.readFileSync(localPath, 'utf8'));
  } else {
    // Fallback to GitHub for production/Vercel
    const response = await fetch('https://raw.githubusercontent.com/Paul-Rajeevan-Nimalarajah/AL-ICT/refs/heads/main/website/data/materials.json');
    if (response.ok) data = await response.json();
  }
  return data;
};

// --- Bot Commands ---

// Start command
bot.start(async (ctx) => {
  saveUser(ctx);
  
  const welcomeMessage = `✨ *Welcome to AL ICT Hub* ✨\n\nYour destination for A/L ICT Tamil Medium materials. Choose an option below to explore:`;
  
  // Clean Navigation Menu
  const mainMenu = Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 Launch Full Hub App', websiteUrl)],
    [
      Markup.button.url('🌐 Visit Website', websiteUrl),
      Markup.button.url('📢 Join Channel', 'https://t.me/alictnoteshub')
    ],
    [Markup.button.url('💻 Online IDE', `${websiteUrl}/online-ide.html`)],
    [Markup.button.url('📞 Contact', 'https://alict.paulrajeevan.com/contact.html')]
  ]);

  await ctx.replyWithMarkdown(welcomeMessage, Markup.removeKeyboard());
  await ctx.reply('👇 Choose an option to begin:', mainMenu);
});

// Broadcast to Users
bot.command('broadcast_users', async (ctx) => {
  const adminId = process.env.ADMIN_ID;
  if (!adminId || ctx.from.id.toString() !== adminId) return ctx.reply('⛔ Unauthorized.');

  const message = ctx.message.text.split(' ').slice(1).join(' ').trim();
  if (!message) return ctx.reply('Usage: `/broadcast_users Your message`');

  if (!fs.existsSync(USERS_FILE)) return ctx.reply('No users found.');
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

  ctx.reply(`🚀 Starting broadcast to ${users.length} users...`);
  
  let successCount = 0;
  for (const userId of users) {
    try {
      await bot.telegram.sendMessage(userId, message, { parse_mode: 'Markdown' });
      successCount++;
    } catch (e) {
      console.error(`Failed: ${userId}`);
    }
    await new Promise(r => setTimeout(r, 50)); 
  }
  ctx.reply(`✅ Sent to ${successCount}/${users.length} users.`);
});

// --- Action Handlers ---

bot.action('main_menu', async (ctx) => {
  await ctx.editMessageText('✨ *AL ICT Hub Main Menu* ✨', {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Launch Full Hub App', websiteUrl)],
      [
        Markup.button.url('🌐 Website', websiteUrl),
        Markup.button.url('📢 Channel', 'https://t.me/alictnoteshub')
      ],
      [Markup.button.url('💻 Online IDE', `${websiteUrl}/online-ide.html`)]
    ])
  });
});

bot.action('contact_admin', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply('To directly reach out, visit: https://alict.paulrajeevan.com/contact.html or message the admin.');
});


// Launch logic
if (process.env.VERCEL) {
  console.log('🌐 Webhook mode active');
} else {
  bot.launch().then(() => console.log('🤖 Bot is running via Polling...'));
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = { bot };
