# Czech Visa Reservation Alert Bot

Automated bot to monitor the Czech visa reservation system for available bridging visa appointment slots.

## Features

- 🔍 **Automated Monitoring**: Continuously checks for available appointment dates
- 📅 **Date Range Filtering**: Monitors specific date ranges (January - February 15, 2026)
- 🔔 **Desktop Notifications**: Alerts you immediately when appointments become available
- 🔐 **Secure Login**: Handles authentication automatically
- ⚡ **Configurable Check Interval**: Set how frequently to check for availability
- 🎯 **Smart Detection**: Identifies available dates (non-red dates on the calendar)

## Prerequisites

- Node.js 16.x or higher
- npm or yarn

## Installation

1. Clone or navigate to this repository:
```bash
cd /home/user/alanxurox
```

2. Install dependencies:
```bash
npm install
```

3. Configure your credentials in the `.env` file (already created with your credentials)

## Configuration

Edit the `.env` file to customize settings:

```env
# Your login credentials
EMAIL=yxu6@babson.edu
PASSWORD=@lan0103XU

# Reservation URL
RESERVATION_URL=https://ipc.gov.cz/en/new-reservation?reservationId=...

# Check interval (in milliseconds)
# 300000 = 5 minutes
# 600000 = 10 minutes
CHECK_INTERVAL=300000

# Date range to monitor (YYYY-MM-DD)
START_DATE=2026-01-01
END_DATE=2026-02-15
```

## Usage

### Start the bot:

```bash
npm start
```

Or with auto-restart on file changes (development):

```bash
npm run dev
```

### What the bot does:

1. Opens the visa reservation page
2. Logs in automatically (if required)
3. Scans the calendar for available dates
4. Checks if any dates between January 1 - February 15, 2026 are available (not red)
5. Sends desktop notification when available dates are found
6. Repeats the check every 5 minutes (configurable)

### When you receive an alert:

1. You'll see a desktop notification with the available date(s)
2. Check the console output for details
3. Click the notification or visit the reservation URL immediately
4. Book your appointment before it's taken!

## How It Works

The bot uses Puppeteer (headless Chrome browser) to:

- Navigate to the Czech visa reservation system
- Authenticate with your credentials
- Analyze the calendar interface
- Detect available dates by checking:
  - Date element colors (avoiding red/unavailable dates)
  - Disabled state
  - CSS classes indicating availability
- Send notifications for new available dates

## Notification System

Currently supports:
- ✅ Desktop notifications (node-notifier)

Future enhancements could include:
- 📧 Email notifications
- 📱 SMS notifications
- 💬 Telegram/Discord/Slack webhooks

## Troubleshooting

### Bot not finding available dates?

1. Check `error-screenshot.png` for visual debugging
2. The website structure may have changed - you may need to update the selectors in `visa-bot.js`
3. Increase the wait times if the page loads slowly

### Login failing?

1. Verify your credentials in `.env`
2. Check if the website requires CAPTCHA
3. Try running in non-headless mode to see what's happening:
   ```javascript
   // In visa-bot.js, change:
   headless: 'new'
   // to:
   headless: false
   ```

### No desktop notifications?

- Ensure you have notification permissions enabled for your terminal/Node.js

## Security Notes

- ⚠️ **Never commit the `.env` file** (it's in `.gitignore`)
- Keep your credentials secure
- This bot is for personal use only
- Use responsibly and respect the website's terms of service

## Files

- `visa-bot.js` - Main bot script
- `package.json` - Dependencies and scripts
- `.env` - Configuration and credentials (not committed)
- `.gitignore` - Files to exclude from git
- `README.md` - This file

## License

MIT

## Disclaimer

This bot is for personal, educational use only. Always respect the terms of service of the Czech visa reservation system. The author is not responsible for any misuse or violations.
