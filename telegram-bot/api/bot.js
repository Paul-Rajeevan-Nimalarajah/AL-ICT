// telegram-bot/api/bot.js
const { bot } = require('../bot.js');

module.exports = async (req, res) => {
  try {
    // Pass the request/response to Telegraf's webhook callback
    await bot.handleUpdate(req.body, res);
  } catch (e) {
    console.error(e);
    res.status(500).send('Something went wrong!');
  }
};
