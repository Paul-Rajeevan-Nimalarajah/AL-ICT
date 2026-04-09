const fs = require('fs');
const fetch = require('node-fetch');

const botToken = process.env.BOT_TOKEN;
const channelUsername = process.env.CHANNEL_USERNAME;

if (!botToken || !channelUsername) {
  console.log('BOT_TOKEN or CHANNEL_USERNAME not set. Skipping notifications.');
  process.exit(0);
}

const sendNotification = async (material, category) => {
  const websiteUrl = 'https://alict.paulrajeevan.com';
  const urlLink = material.href.startsWith('http') ? material.href : `${websiteUrl}/${material.href.replace(/^\//, '')}`;
  
  const message = `🎉 *New Study Material Added!*\n\n*Category:* ${category}\n*Title:* ${material.title}\n\n👉 [Click here to view/download](${urlLink})\n\n— Posted via @alictnoteshub_bot 🤖`;
  
  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  try {
    const res = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelUsername,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });
    
    if (!res.ok) {
        console.error('Failed to send message:', await res.text());
    } else {
        console.log(`Successfully notified channel about: ${material.title}`);
    }
  } catch (err) {
    console.error('Network error while notifying channel:', err);
  }
};

const getItems = (data) => {
    let items = [];
    if (data.notes) items = items.concat(data.notes.map(i => ({...i, category: 'Notes'})));
    if (data.models) items = items.concat(data.models.map(i => ({...i, category: 'Model Papers'})));
    if (data.pastPapers) items = items.concat(data.pastPapers.map(i => ({...i, category: 'Past Papers'})));
    return items;
};

const main = async () => {
    try {
        const oldDataPath = process.argv[2];
        const newDataPath = process.argv[3];

        const oldData = fs.existsSync(oldDataPath) ? JSON.parse(fs.readFileSync(oldDataPath, 'utf8')) : {};
        const newData = fs.existsSync(newDataPath) ? JSON.parse(fs.readFileSync(newDataPath, 'utf8')) : {};

        const oldItems = getItems(oldData);
        const newItems = getItems(newData);

        const oldUrls = new Set(oldItems.map(i => i.href));

        const newlyAdded = newItems.filter(item => !oldUrls.has(item.href));

        console.log(`Found ${newlyAdded.length} new materials to notify.`);

        for (const item of newlyAdded) {
            await sendNotification(item, item.category);
            // delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    } catch (e) {
        console.error('Error during notification script:', e);
        process.exit(1);
    }
};

main();
