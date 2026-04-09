const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

// Initialize the bot with your token
const bot = new Telegraf(process.env.BOT_TOKEN);

// Your website URL
const websiteUrl = 'https://alict.paulrajeevan.com'; 

// --- Bot Commands ---

// 1. /start command - Main Menu
bot.start((ctx) => {
  const welcomeMessage = `Welcome to the *AL ICT Tamil Medium Notes Hub Bot*! 🎓\n\nI can help you navigate to the best study materials available on our website. Please choose an option below:`;
  
  ctx.replyWithMarkdown(welcomeMessage, 
    Markup.inlineKeyboard([
      [
        Markup.button.callback('🔍 Show All Materials', 'show_materials'),
      ],
      [
        Markup.button.url('📚 Notes', `${websiteUrl}/notes.html`), 
        Markup.button.url('📝 Past Papers', `${websiteUrl}/past-papers.html`)
      ],
      [
        Markup.button.url('📄 Model Papers', `${websiteUrl}/model-papers.html`), 
        Markup.button.url('💻 Online IDE', `${websiteUrl}/online-ide.html`)
      ],
      [
        Markup.button.callback('📞 Contact Admin', 'contact_admin'), 
        Markup.button.url('🌐 Visit Website', websiteUrl)
      ]
    ])
  );
});

// 2. /materials command
const showMaterials = async (ctx) => {
  try {
    ctx.reply('⏳ Fetching latest study materials...');
    const response = await fetch('https://raw.githubusercontent.com/Paul-Rajeevan-Nimalarajah/AL-ICT/refs/heads/main/website/data/materials.json');
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    const sendChunks = async (title, items, baseUrl = '') => {
      if (!items || items.length === 0) return;
      
      let message = `📚 *${title}*\n\n`;
      let chunks = [];
      
      for (const item of items) {
        const link = item.href.startsWith('http') ? item.href : `${baseUrl}/${item.href.replace(/^\//, '')}`;
        const line = `• [${item.title}](${link})\n`;
        
        if (message.length + line.length > 3900) {
          chunks.push(message);
          message = line;
        } else {
          message += line;
        }
      }
      if (message.length > 0) chunks.push(message);
      
      for (const chunk of chunks) {
        await ctx.replyWithMarkdown(chunk, { disable_web_page_preview: true });
        await new Promise(r => setTimeout(r, 500)); // anti-flood
      }
    };

    await sendChunks('Unit Notes', data.notes, websiteUrl);
    await sendChunks('Model Papers', data.models, websiteUrl);
    await sendChunks('Past Papers', data.pastPapers, websiteUrl);
    
  } catch (err) {
    console.error('Failed to fetch materials:', err);
    ctx.reply(`Could not fetch the latest materials. Please visit ${websiteUrl} directly!`);
  }
};

bot.command('materials', showMaterials);
bot.action('show_materials', (ctx) => {
  ctx.answerCbQuery();
  showMaterials(ctx);
});

// 3. /notes, /pastpapers, etc...
bot.command('notes', (ctx) => {
  ctx.reply('Get access to all unit notes here:', Markup.inlineKeyboard([
    Markup.button.url('Go to Notes', `${websiteUrl}/notes.html`)
  ]));
});

// 4. /contact command
bot.command('contact', (ctx) => {
  ctx.reply(`Need help? You can connect with us through our contact page: ${websiteUrl}/contact.html`);
});

// Callback query handler for "Contact Admin" inline button
bot.action('contact_admin', (ctx) => {
  ctx.answerCbQuery(); // tell telegram we handled the click
  ctx.reply('To directly reach out, you can message the channel admin or visit our website for the full contact details.');
});

// --- Channel Admin Commands ---

// /broadcast <message> - Sends a message to the linked channel
bot.command('broadcast', async (ctx) => {
  const adminId = process.env.ADMIN_ID; // Your user ID from .env
  const channelUsername = process.env.CHANNEL_USERNAME; // e.g., @al_ict_notes

  if (!adminId || ctx.from.id.toString() !== adminId) return ctx.reply('⛔ You are not authorized to use the admin broadcast command.');

  const message = ctx.message.text.replace('/broadcast', '').trim();
  if (!message) return ctx.reply('Usage: `/broadcast Your message here`', { parse_mode: 'Markdown' });
  if (!channelUsername) return ctx.reply('⚠️ CHANNEL_USERNAME is not set in the .env file.');

  try {
    await bot.telegram.sendMessage(channelUsername, message);
    ctx.reply('✅ Message broadcasted successfully to the channel!');
  } catch (err) {
    console.error('Broadcast error:', err);
    ctx.reply(`❌ Failed to broadcast. Error: ${err.message}`);
  }
});

// Only launch in polling mode if NOT running on Vercel
if (!process.env.VERCEL) {
  bot.launch().then(() => {
    console.log('🤖 Telegram Bot is running in polling mode...');
  });
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Export bot for Vercel serverless function
module.exports = { bot };
