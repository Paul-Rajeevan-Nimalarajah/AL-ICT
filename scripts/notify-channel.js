const fs = require('fs');
const fetch = require('node-fetch');

const botToken = process.env.BOT_TOKEN;
const channelUsername = process.env.CHANNEL_USERNAME;

if (!botToken || !channelUsername) {
  console.log('BOT_TOKEN or CHANNEL_USERNAME not set. Skipping notifications.');
  process.exit(0);
}

const escapeHTML = (str) => str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
})[m]);

const sendNotification = async (material, category) => {
  const websiteUrl = 'https://alict.paulrajeevan.com';
  const urlLink = material.href.startsWith('http') ? material.href : `${websiteUrl}/${material.href.replace(/^\//, '')}`;
  
  const message = `🎉 <b>New Study Material Added!</b>\n\n` +
                  `<b>Category:</b> ${escapeHTML(category)}\n` +
                  `<b>Title:</b> ${escapeHTML(material.title)}\n\n` +
                  `👉 <a href="${urlLink}">Click here to view/download</a>\n\n` +
                  `— Posted via @alictnoteshubbot 🤖`;
  
  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  try {
    const res = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelUsername,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
    
    const responseText = await res.text();
    if (!res.ok) {
        console.error('Failed to send message:', responseText);
        throw new Error(`Telegram API Error: ${responseText}`);
    } else {
        console.log(`Successfully notified channel about: ${material.title}`);
    }
  } catch (err) {
    console.error('Error while notifying channel:', err.message);
    throw err; // Re-throw to trigger process.exit(1) in main()
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

        console.log('Successfully parsed old and new materials data.');
        
        const oldItems = getItems(oldData);
        const newItems = getItems(newData);

        console.log(`Comparing items: ${oldItems.length} old vs ${newItems.length} new.`);

        const newlyAdded = newItems.filter(item => {
            const oldItem = oldItems.find(oi => oi.href === item.href);
            // Notify if item is new or if its group has changed (e.g. from Other to Unit 9)
            return !oldItem || oldItem.group !== item.group;
        });

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
