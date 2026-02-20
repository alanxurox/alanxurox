# Czech Visa Reservation Alert Bot

Automated bot to monitor the Czech visa reservation system for available bridging visa appointment slots.

## Features

- 🔍 **Automated Monitoring**: Continuously checks for available appointment dates
- 📅 **Date Range Filtering**: Monitors specific date ranges (January - February 15, 2026)
- 🔔 **Desktop Notifications**: Alerts you immediately when appointments become available
- 🔐 **Secure Login**: Handles authentication automatically
- ⚡ **Configurable Check Interval**: Set how frequently to check for availability
- 🎯 **Smart Detection**: Identifies available dates (non-red dates on the calendar)
- 🖱️ **Interactive Clicking**: Clicks on dates to reveal time slots (handles JavaScript-heavy calendars)
- 📆 **Month Navigation**: Automatically navigates through January and February
- 🐛 **Debug Mode**: See the browser window and screenshots for troubleshooting

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

# Debug mode - set to true to see browser and save screenshots
DEBUG_MODE=false
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

The bot uses Puppeteer (headless Chrome browser) with **two detection strategies**:

### Strategy 1: Interactive Clicking
- Clicks on each date in the calendar
- Waits for time slots to appear (handles JavaScript-heavy calendars)
- Checks if any time slots are available (not red/disabled)
- This catches dates that only reveal availability after clicking

### Strategy 2: Visual Analysis
- Analyzes date elements for color and styling
- Detects dates that are NOT marked as:
  - Red/unavailable
  - Disabled
  - Blocked
- Looks for dates explicitly marked as green/available

### Additional Features
- **Month Navigation**: Automatically navigates to January and February 2026
- **Multiple Selectors**: Tries various CSS selectors to find calendar elements
- **Debug Mode**: Saves screenshots at each step for troubleshooting
- **Robust Detection**: Works with dynamic JavaScript calendars

The bot checks both strategies and combines results to ensure no available dates are missed!

## Notification System

Currently supports:
- ✅ Desktop notifications (node-notifier)

Future enhancements could include:
- 📧 Email notifications
- 📱 SMS notifications
- 💬 Telegram/Discord/Slack webhooks

## Troubleshooting

### Bot not finding available dates?

**Enable Debug Mode first:**
1. Set `DEBUG_MODE=true` in `.env`
2. Run the bot - it will show the browser window and save screenshots
3. Check the screenshots saved as:
   - `debug-initial.png` - Initial page load
   - `debug-January-2026.png` - January calendar view
   - `debug-February-2026.png` - February calendar view
   - `error-screenshot.png` - If errors occur

**Other fixes:**
1. The website structure may have changed - update selectors in `visa-bot.js`
2. Increase wait times in the code if page loads slowly
3. Check console output for which strategy is running

### Login failing?

1. Verify your credentials in `.env`
2. Set `DEBUG_MODE=true` to watch the login process
3. Check if the website requires CAPTCHA (bot will need manual intervention)
4. Look for error messages in console output

### Bot clicks dates but doesn't detect availability?

1. Enable debug mode to see what's happening
2. The time slots might use different selectors - check the code around line 340
3. Adjust the wait time after clicking (currently 500ms) if slots load slowly

### No desktop notifications?

- Ensure you have notification permissions enabled for your terminal/Node.js
- Test notifications manually: the bot logs alerts to console first

### Debug Mode Explained

When `DEBUG_MODE=true`:
- Browser window opens (not headless) so you can watch
- Actions are slowed down (100ms delay) for easier observation
- Screenshots are saved at each major step
- Useful for understanding what the bot sees vs. what you expect

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
