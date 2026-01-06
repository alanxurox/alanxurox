require('dotenv').config();
const puppeteer = require('puppeteer');
const notifier = require('node-notifier');

// Configuration
const CONFIG = {
  email: process.env.EMAIL,
  password: process.env.PASSWORD,
  reservationUrl: process.env.RESERVATION_URL,
  checkInterval: parseInt(process.env.CHECK_INTERVAL) || 300000, // 5 minutes default
  startDate: new Date(process.env.START_DATE || '2026-01-01'),
  endDate: new Date(process.env.END_DATE || '2026-02-15'),
};

// Track previously found available dates to avoid duplicate notifications
let previouslyAvailableDates = new Set();

/**
 * Main bot function to check visa appointment availability
 */
async function checkVisaAvailability() {
  let browser;

  try {
    console.log(`\n[${new Date().toLocaleString()}] Starting visa availability check...`);

    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('Navigating to reservation page...');
    await page.goto(CONFIG.reservationUrl, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Check if login is required
    const needsLogin = await checkIfLoginRequired(page);

    if (needsLogin) {
      console.log('Login required. Attempting to login...');
      await performLogin(page);
    }

    // Check for available dates
    console.log('Checking for available appointment dates...');
    const availableDates = await findAvailableDates(page);

    if (availableDates.length > 0) {
      console.log(`\n✓ Found ${availableDates.length} available date(s):`);
      availableDates.forEach(date => console.log(`  - ${date}`));

      // Send notifications for new available dates
      const newDates = availableDates.filter(date => !previouslyAvailableDates.has(date));

      if (newDates.length > 0) {
        sendNotification(newDates);
        newDates.forEach(date => previouslyAvailableDates.add(date));
      } else {
        console.log('(No new dates since last check)');
      }
    } else {
      console.log('✗ No available dates found.');
    }

    await browser.close();

  } catch (error) {
    console.error('Error during availability check:', error.message);
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Check if the page requires login
 */
async function checkIfLoginRequired(page) {
  try {
    // Look for common login indicators
    const loginSelectors = [
      'input[type="email"]',
      'input[type="password"]',
      'input[name="email"]',
      'input[name="password"]',
      'form[action*="login"]',
      'button:has-text("Login")',
      'button:has-text("Sign in")'
    ];

    for (const selector of loginSelectors) {
      const element = await page.$(selector);
      if (element) {
        return true;
      }
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Perform login to the reservation system
 */
async function performLogin(page) {
  try {
    // Wait for email input
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });

    // Fill in email
    await page.type('input[type="email"], input[name="email"]', CONFIG.email);

    // Fill in password
    await page.type('input[type="password"], input[name="password"]', CONFIG.password);

    // Click login button
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
      await loginButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      console.log('Login successful!');
    }
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
}

/**
 * Find available appointment dates (non-red dates)
 */
async function findAvailableDates(page) {
  try {
    const availableDates = [];

    // Wait for calendar to load
    await page.waitForTimeout(2000);

    // Strategy 1: Look for calendar date elements
    // Common class names for calendar dates: .calendar-day, .date-cell, .day, etc.
    const dateElements = await page.$$('[class*="calendar"] [class*="day"], [class*="date-cell"], .day, td[data-date]');

    if (dateElements.length > 0) {
      console.log(`Found ${dateElements.length} date elements to check...`);

      for (const element of dateElements) {
        try {
          // Get the date value and styling
          const dateInfo = await page.evaluate(el => {
            const dateValue = el.getAttribute('data-date') ||
                            el.getAttribute('data-day') ||
                            el.textContent.trim();

            const computedStyle = window.getComputedStyle(el);
            const bgColor = computedStyle.backgroundColor;
            const color = computedStyle.color;
            const classes = el.className;

            // Check if the element is disabled or marked as unavailable
            const isDisabled = el.hasAttribute('disabled') ||
                             classes.includes('disabled') ||
                             classes.includes('unavailable') ||
                             classes.includes('blocked');

            // Check if the date is marked as red (unavailable)
            const isRed = bgColor.includes('rgb(255, 0, 0)') ||
                         bgColor.includes('rgb(220, 53, 69)') ||
                         color.includes('rgb(255, 0, 0)') ||
                         classes.includes('red') ||
                         classes.includes('unavailable');

            return { dateValue, isDisabled, isRed, classes, bgColor, color };
          }, element);

          // Parse the date and check if it's in our target range
          const date = parseDate(dateInfo.dateValue);

          if (date && date >= CONFIG.startDate && date < CONFIG.endDate) {
            // If the date is not disabled and not red, it's available
            if (!dateInfo.isDisabled && !dateInfo.isRed) {
              availableDates.push(formatDate(date));
            }
          }
        } catch (err) {
          // Skip this element if there's an error
          continue;
        }
      }
    }

    // Strategy 2: Look for clickable date buttons
    if (availableDates.length === 0) {
      const clickableDates = await page.$$('button[class*="date"]:not([disabled]), a[class*="date"]:not([disabled])');

      for (const element of clickableDates) {
        const dateText = await page.evaluate(el => el.textContent.trim(), element);
        const date = parseDate(dateText);

        if (date && date >= CONFIG.startDate && date < CONFIG.endDate) {
          availableDates.push(formatDate(date));
        }
      }
    }

    return [...new Set(availableDates)].sort();

  } catch (error) {
    console.error('Error finding available dates:', error.message);

    // Take a screenshot for debugging
    try {
      await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
      console.log('Screenshot saved to error-screenshot.png');
    } catch (screenshotError) {
      // Ignore screenshot errors
    }

    return [];
  }
}

/**
 * Parse date string into Date object
 */
function parseDate(dateStr) {
  if (!dateStr) return null;

  try {
    // Try different date formats
    const formats = [
      // ISO format: 2026-01-15
      /^(\d{4})-(\d{2})-(\d{2})$/,
      // European format: 15.01.2026 or 15/01/2026
      /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/,
      // US format: 01/15/2026
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (format === formats[0]) {
          // ISO format
          return new Date(match[1], match[2] - 1, match[3]);
        } else if (format === formats[1]) {
          // European format
          return new Date(match[3], match[2] - 1, match[1]);
        } else if (format === formats[2]) {
          // US format
          return new Date(match[3], match[1] - 1, match[2]);
        }
      }
    }

    // Try parsing as-is
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Send notification when available dates are found
 */
function sendNotification(dates) {
  const message = dates.length === 1
    ? `Available appointment on: ${dates[0]}`
    : `Available appointments on:\n${dates.join('\n')}`;

  console.log('\n🔔 ALERT: New available dates found!');
  console.log(message);
  console.log(`\nBook now at: ${CONFIG.reservationUrl}\n`);

  // Desktop notification
  notifier.notify({
    title: '🎉 Czech Visa Appointment Available!',
    message: message,
    sound: true,
    wait: true,
    timeout: 30
  });

  // You can also add other notification methods here:
  // - Email notification
  // - SMS notification
  // - Telegram/Discord/Slack webhook
}

/**
 * Main loop to continuously check for availability
 */
async function startBot() {
  console.log('='.repeat(60));
  console.log('Czech Visa Reservation Alert Bot');
  console.log('='.repeat(60));
  console.log(`Monitoring: ${CONFIG.reservationUrl}`);
  console.log(`Date range: ${formatDate(CONFIG.startDate)} to ${formatDate(CONFIG.endDate)}`);
  console.log(`Check interval: ${CONFIG.checkInterval / 1000} seconds`);
  console.log('='.repeat(60));

  // Initial check
  await checkVisaAvailability();

  // Set up recurring checks
  setInterval(async () => {
    await checkVisaAvailability();
  }, CONFIG.checkInterval);

  console.log(`\nBot is running. Checks will occur every ${CONFIG.checkInterval / 60000} minutes.`);
  console.log('Press Ctrl+C to stop.\n');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down bot gracefully...');
  process.exit(0);
});

// Start the bot
startBot().catch(error => {
  console.error('Fatal error starting bot:', error);
  process.exit(1);
});
