# AL ICT Hub Telegram Bot

This is a Telegram Bot built with Node.js and `telegraf` to help users navigate the AL ICT Tamil Medium Notes Hub website and to manage the official Telegram Channel.

## Features
- Interactive inline keyboard menus for navigating the website.
- Direct links to Notes, Past Papers, Model Papers, and Online IDE.
- Admin command (`/broadcast`) to send messages directly to the linked Telegram channel.

## Setup Instructions

### 1. Prerequisites
- **Node.js** (v14 or higher installed).
- A **Telegram Bot Token** from [@BotFather](https://t.me/BotFather).
- A **Telegram Channel**. Follow these steps to allow the bot to post:
  1. Add the bot to your Telegram channel as an **Administrator**.
  2. Give it permission to "Post Messages".

### 2. Configure Environment Variables
Open the `.env` file in this directory and fill in your details:

```env
BOT_TOKEN=your_token_from_botfather
ADMIN_ID=your_personal_telegram_user_id
CHANNEL_USERNAME=@your_channel_username
```
*(Tip: You can use a bot like `@userinfobot` to find your personal `ADMIN_ID`.)*

### 3. Install Dependencies
Open a terminal in this directory (`telegram-bot`) and run:
```bash
npm install
```

### 4. Run the Bot
To start the bot, run:
```bash
npm start
```
You should see `🤖 Telegram Bot is running...` in your terminal. You can now go to Telegram and start chatting with your bot!

## Commands
* ` `/start` - Shows the main navigation menu.
* ` `/notes` - Quick link to the notes section.
* ` `/contact` - Quick link to the contact page.
* ` `/broadcast <message>` - *(Admin only)* Broadcasts your message to the channel.
