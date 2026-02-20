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
  debugMode: process.env.DEBUG_MODE === 'true', // Set to true to see browser and save screenshots
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
      headless: CONFIG.debugMode ? false : 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      slowMo: CONFIG.debugMode ? 100 : 0 // Slow down actions in debug mode
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
 * This function handles JavaScript-heavy calendars that require interaction
 */
async function findAvailableDates(page) {
  try {
    const availableDates = [];

    // Wait for calendar/content to load and JavaScript to execute
    console.log('Waiting for page to fully render...');
    await page.waitForTimeout(3000);

    // Take initial screenshot in debug mode
    if (CONFIG.debugMode) {
      await page.screenshot({ path: 'debug-initial.png', fullPage: true });
      console.log('📸 Initial screenshot saved to debug-initial.png');
    }

    // Look for common calendar selectors and wait for them
    const calendarSelectors = [
      '[class*="calendar"]',
      '[class*="datepicker"]',
      '[class*="date-picker"]',
      'table[class*="calendar"]',
      'div[class*="calendar"]',
      '[role="grid"]',
      '.calendar',
      '.datepicker'
    ];

    let calendarFound = false;
    for (const selector of calendarSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`✓ Found calendar with selector: ${selector}`);
        calendarFound = true;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!calendarFound) {
      console.log('⚠️  No calendar element found, will try generic date detection');
    }

    // Navigate to January and February months to check both
    const monthsToCheck = await navigateToTargetMonths(page);
    console.log(`Will check ${monthsToCheck.length} month(s) for availability`);

    // For each month, check all dates
    for (const monthInfo of monthsToCheck) {
      console.log(`\nChecking ${monthInfo}...`);
      await page.waitForTimeout(2000); // Wait for month to render

      if (CONFIG.debugMode) {
        await page.screenshot({ path: `debug-${monthInfo.replace(/\s+/g, '-')}.png`, fullPage: true });
        console.log(`📸 Screenshot saved for ${monthInfo}`);
      }

      // Strategy 1: Interactive clicking - click each date to see if time slots appear
      const interactiveDates = await checkDatesInteractively(page);
      availableDates.push(...interactiveDates);

      // Strategy 2: Visual analysis - check colors and classes
      const visualDates = await checkDatesVisually(page);
      availableDates.push(...visualDates);

      // Navigate to next month if needed
      if (monthsToCheck.indexOf(monthInfo) < monthsToCheck.length - 1) {
        await clickNextMonth(page);
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
 * Navigate to target months (January and February 2026)
 */
async function navigateToTargetMonths(page) {
  const monthsToCheck = [];
  const currentMonth = new Date().getMonth(); // 0-11
  const currentYear = new Date().getFullYear();
  const targetYear = CONFIG.startDate.getFullYear();
  const startMonth = CONFIG.startDate.getMonth(); // 0 = January
  const endMonth = CONFIG.endDate.getMonth(); // 1 = February

  // If we need to navigate to a future month
  if (targetYear > currentYear || (targetYear === currentYear && startMonth > currentMonth)) {
    const monthsToNavigate = ((targetYear - currentYear) * 12) + (startMonth - currentMonth);
    console.log(`Navigating ${monthsToNavigate} month(s) forward...`);

    for (let i = 0; i < monthsToNavigate; i++) {
      await clickNextMonth(page);
      await page.waitForTimeout(1000);
    }
  }

  // Add months to check
  monthsToCheck.push('January 2026');
  if (endMonth > startMonth) {
    monthsToCheck.push('February 2026');
  }

  return monthsToCheck;
}

/**
 * Click next month button in calendar
 */
async function clickNextMonth(page) {
  const nextMonthSelectors = [
    'button[class*="next"]',
    'button[class*="forward"]',
    'button[aria-label*="next"]',
    '[class*="calendar"] button:last-child',
    '.next-month',
    '[title*="Next"]'
  ];

  for (const selector of nextMonthSelectors) {
    try {
      const button = await page.$(selector);
      if (button) {
        await button.click();
        console.log('Clicked next month button');
        return true;
      }
    } catch (e) {
      continue;
    }
  }

  console.log('⚠️  Could not find next month button');
  return false;
}

/**
 * Check dates by clicking on them to see if time slots appear
 */
async function checkDatesInteractively(page) {
  const availableDates = [];

  try {
    // Find all date elements (buttons, cells, etc.)
    const dateSelectors = [
      'td[class*="day"]:not([class*="disabled"])',
      'button[class*="day"]:not([disabled])',
      'div[class*="day"]:not([class*="disabled"])',
      '[role="gridcell"]:not([aria-disabled="true"])',
      'td.day:not(.disabled)',
      'button.day:not(:disabled)'
    ];

    for (const selector of dateSelectors) {
      const dateElements = await page.$$(selector);

      if (dateElements.length > 0) {
        console.log(`Found ${dateElements.length} clickable date elements with: ${selector}`);

        for (const element of dateElements) {
          try {
            // Get date info before clicking
            const dateInfo = await page.evaluate(el => {
              const text = el.textContent.trim();
              const classes = el.className;
              const isDisabled = el.hasAttribute('disabled') ||
                               el.getAttribute('aria-disabled') === 'true' ||
                               classes.includes('disabled');

              return { text, classes, isDisabled };
            }, element);

            if (dateInfo.isDisabled) continue;

            // Click the date to see if times become available
            await element.click();
            await page.waitForTimeout(500); // Wait for time slots to appear

            // Check if time slots appeared (indicating availability)
            const hasTimeSlots = await page.evaluate(() => {
              const timeSelectors = [
                '[class*="time"]',
                '[class*="slot"]',
                'button[class*="time"]',
                'select[class*="time"]'
              ];

              for (const sel of timeSelectors) {
                const elements = document.querySelectorAll(sel);
                if (elements.length > 0) {
                  // Check if any time slots are not disabled/red
                  for (const elem of elements) {
                    const style = window.getComputedStyle(elem);
                    const isRed = style.backgroundColor.includes('255, 0, 0') ||
                                 style.color.includes('255, 0, 0') ||
                                 elem.className.includes('disabled') ||
                                 elem.className.includes('unavailable');

                    if (!isRed && !elem.hasAttribute('disabled')) {
                      return true;
                    }
                  }
                }
              }
              return false;
            });

            if (hasTimeSlots) {
              // This date has available time slots!
              const currentMonthYear = await page.evaluate(() => {
                const monthEl = document.querySelector('[class*="month"]');
                return monthEl ? monthEl.textContent : '';
              });

              const dateStr = parseDateFromElement(dateInfo.text, currentMonthYear);
              if (dateStr && isInTargetRange(dateStr)) {
                console.log(`  ✓ Date ${dateStr} has available time slots`);
                availableDates.push(dateStr);
              }
            }

          } catch (err) {
            // Continue to next date if there's an error
            continue;
          }
        }

        // If we found dates with this selector, we can stop
        if (dateElements.length > 0) break;
      }
    }

  } catch (error) {
    console.log('Interactive checking failed:', error.message);
  }

  return availableDates;
}

/**
 * Check dates by analyzing their visual appearance (color, classes)
 */
async function checkDatesVisually(page) {
  const availableDates = [];

  try {
    // Get all date information from the page
    const datesInfo = await page.evaluate(() => {
      const results = [];

      // Look for all potential date elements
      const selectors = [
        'td[class*="day"]',
        'button[class*="day"]',
        'div[class*="day"]',
        '[role="gridcell"]',
        'td.day',
        'button.day'
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);

        for (const el of elements) {
          const style = window.getComputedStyle(el);
          const text = el.textContent.trim();

          // Skip if empty or not a number
          if (!text || !/\d/.test(text)) continue;

          const info = {
            text: text,
            classes: el.className,
            bgColor: style.backgroundColor,
            color: style.color,
            isDisabled: el.hasAttribute('disabled') ||
                       el.getAttribute('aria-disabled') === 'true' ||
                       el.className.includes('disabled') ||
                       el.className.includes('unavailable'),
            isRed: style.backgroundColor.includes('255, 0, 0') ||
                   style.backgroundColor.includes('220, 53, 69') ||
                   style.color.includes('255, 0, 0') ||
                   el.className.includes('red') ||
                   el.className.includes('unavailable') ||
                   el.className.includes('blocked'),
            isGreen: style.backgroundColor.includes('0, 255, 0') ||
                    style.backgroundColor.includes('40, 167, 69') ||
                    el.className.includes('green') ||
                    el.className.includes('available'),
          };

          results.push(info);
        }

        // If we found dates, use them
        if (results.length > 0) break;
      }

      return results;
    });

    console.log(`Visual analysis found ${datesInfo.length} date elements`);

    // Get current month/year for context
    const currentMonthYear = await page.evaluate(() => {
      const selectors = [
        '[class*="month"]',
        '[class*="current"]',
        '.calendar-header',
        'h2', 'h3'
      ];

      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && /\d{4}/.test(el.textContent)) {
          return el.textContent.trim();
        }
      }
      return '';
    });

    for (const dateInfo of datesInfo) {
      // Date is available if it's NOT disabled and NOT red
      // Or if it's explicitly marked as green/available
      const isAvailable = (!dateInfo.isDisabled && !dateInfo.isRed) || dateInfo.isGreen;

      if (isAvailable) {
        const dateStr = parseDateFromElement(dateInfo.text, currentMonthYear);
        if (dateStr && isInTargetRange(dateStr)) {
          console.log(`  ✓ Date ${dateStr} appears available (not red/disabled)`);
          availableDates.push(dateStr);
        }
      }
    }

  } catch (error) {
    console.log('Visual checking failed:', error.message);
  }

  return availableDates;
}

/**
 * Parse date from element text and month context
 */
function parseDateFromElement(dayText, monthContext) {
  try {
    const day = parseInt(dayText);
    if (isNaN(day) || day < 1 || day > 31) return null;

    // Extract month and year from context
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];

    let month = -1;
    let year = CONFIG.startDate.getFullYear();

    for (let i = 0; i < monthNames.length; i++) {
      if (monthContext.includes(monthNames[i])) {
        month = i;
        break;
      }
    }

    // Extract year from context
    const yearMatch = monthContext.match(/\d{4}/);
    if (yearMatch) {
      year = parseInt(yearMatch[0]);
    }

    if (month === -1) {
      // Default to start month if we can't find it
      month = CONFIG.startDate.getMonth();
    }

    const date = new Date(year, month, day);
    return formatDate(date);

  } catch (error) {
    return null;
  }
}

/**
 * Check if date string is in target range
 */
function isInTargetRange(dateStr) {
  const date = parseDate(dateStr);
  return date && date >= CONFIG.startDate && date < CONFIG.endDate;
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
