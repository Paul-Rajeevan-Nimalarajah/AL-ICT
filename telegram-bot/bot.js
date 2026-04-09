const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize the bot with your token
const bot = new Telegraf(process.env.BOT_TOKEN);

// Your website URL
const websiteUrl = 'https://alict.paulrajeevan.com'; 
const USERS_FILE = path.join(__dirname, 'users.json');

// --- Helper Functions ---

// 1. User Tracking
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
      console.log(`New user registered: ${userId}`);
    }
  } catch (e) {
    console.error('Error saving user:', e);
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
bot.start((ctx) => {
  saveUser(ctx);
  const welcomeMessage = `Welcome to the *AL ICT Tamil Medium Notes Hub Bot*! 🎓\n\nI can help you browse study materials easily. Choose a category below:`;
  
  ctx.replyWithMarkdown(welcomeMessage, 
    Markup.inlineKeyboard([
      [Markup.button.callback('📚 Unit Notes', 'menu_notes')],
      [Markup.button.callback('📄 Model Papers', 'menu_models')],
      [Markup.button.callback('📝 Past Papers', 'menu_past')],
      [Markup.button.callback('💻 Online IDE', 'contact_admin'), Markup.button.url('🌐 Website', websiteUrl)],
      [Markup.button.callback('📞 Contact Admin', 'contact_admin')]
    ])
  );
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
      console.error(`Failed to send to ${userId}:`, e.message);
    }
    // Anti-flood: 30 messages per second limit
    await new Promise(r => setTimeout(r, 50)); 
  }
  ctx.reply(`✅ Broadcast complete. Successfully sent to ${successCount}/${users.length} users.`);
});

// --- Navigation Handlers ---

// Main Category Menus
bot.action('menu_notes', async (ctx) => {
  const data = await getMaterials();
  if (!data?.notesGroups) return ctx.answerCbQuery('Data loading...');
  
  const buttons = data.notesGroups.map(g => [Markup.button.callback(g, `list_notes:${g}:0`)]);
  buttons.push([Markup.button.callback('⬅️ Back to Main Menu', 'main_menu')]);
  
  await ctx.editMessageText('📚 *Select Unit/Category:*', {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(buttons)
  });
});

bot.action('menu_models', async (ctx) => {
  const data = await getMaterials();
  const buttons = data.modelsGroups.map(g => [Markup.button.callback(`Year ${g}`, `list_models:${g}:0`)]);
  buttons.push([Markup.button.callback('⬅️ Back to Main Menu', 'main_menu')]);
  
  await ctx.editMessageText('📄 *Select Model Paper Year:*', {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(buttons)
  });
});

bot.action('menu_past', async (ctx) => {
  const data = await getMaterials();
  const buttons = data.pastPapersGroups.map(g => [Markup.button.callback(`Year ${g}`, `list_past:${g}:0`)]);
  buttons.push([Markup.button.callback('⬅️ Back to Main Menu', 'main_menu')]);
  
  await ctx.editMessageText('📝 *Select Past Paper Year:*', {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(buttons)
  });
});

// List items for a selected category (with pagination)
const handleList = async (ctx, type, group, page) => {
  const data = await getMaterials();
  const items = data[type].filter(i => i.group === group);
  const PAGE_SIZE = 8;
  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const chunk = items.slice(start, end);
  
  let text = `📂 *${group}* (${type === 'notes' ? 'Notes' : 'Papers'})\nPage ${page + 1}/${Math.ceil(items.length/PAGE_SIZE)}\n\n`;
  
  const buttons = [];
  chunk.forEach(item => {
    const url = item.href.startsWith('http') ? item.href : `${websiteUrl}/${item.href.replace(/^\//, '')}`;
    buttons.push([Markup.button.url(item.title, url)]);
  });

  // Pagination buttons
  const navRow = [];
  if (page > 0) navRow.push(Markup.button.callback('⬅️ Prev', `list_${type}:${group}:${page - 1}`));
  if (end < items.length) navRow.push(Markup.button.callback('Next ➡️', `list_${type}:${group}:${page + 1}`));
  if (navRow.length > 0) buttons.push(navRow);

  buttons.push([Markup.button.callback('⬅️ Back to Categories', `menu_${type}`)]);

  try {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...Markup.inlineKeyboard(buttons)
    });
  } catch (e) {
    // If text is same, avoid error
  }
};

bot.action(/^list_(notes|models|past):(.+):(\d+)$/, (ctx) => {
  const [, type, group, page] = ctx.match;
  handleList(ctx, type, group, parseInt(page));
});

bot.action('main_menu', (ctx) => {
  ctx.editMessageText(`Choose a category below:`, {
    ...Markup.inlineKeyboard([
      [Markup.button.callback('📚 Unit Notes', 'menu_notes')],
      [Markup.button.callback('📄 Model Papers', 'menu_models')],
      [Markup.button.callback('📝 Past Papers', 'menu_past')],
      [Markup.button.callback('📞 Contact Admin', 'contact_admin')]
    ])
  });
});

bot.action('contact_admin', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply('To directly reach out, visit: https://alict.paulrajeevan.com/contact.html or message the admin.');
});

// Launch logic
if (!process.env.VERCEL) {
  bot.launch().then(() => console.log('🤖 Telegram Bot (NAV MODE) is running...'));
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = { bot };
