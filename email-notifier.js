/**
 * Optional Email Notification Module
 *
 * To use email notifications:
 * 1. Install nodemailer: npm install nodemailer
 * 2. Add email settings to .env:
 *    EMAIL_NOTIFICATIONS=true
 *    SMTP_HOST=smtp.gmail.com
 *    SMTP_PORT=587
 *    SMTP_USER=your-email@gmail.com
 *    SMTP_PASS=your-app-specific-password
 *    NOTIFY_EMAIL=your-email@gmail.com
 * 3. Import this module in visa-bot.js:
 *    const { sendEmailNotification } = require('./email-notifier');
 * 4. Call it in the sendNotification function:
 *    await sendEmailNotification(dates, CONFIG.reservationUrl);
 */

require('dotenv').config();

async function sendEmailNotification(dates, reservationUrl) {
  // Only send if email notifications are enabled
  if (process.env.EMAIL_NOTIFICATIONS !== 'true') {
    return;
  }

  try {
    const nodemailer = require('nodemailer');

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const datesList = dates.map(d => `<li>${d}</li>`).join('');

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.NOTIFY_EMAIL,
      subject: '🎉 Czech Visa Appointment Available!',
      html: `
        <h2>✅ Available Visa Appointment Detected!</h2>
        <p>The Czech visa reservation bot found available appointment dates:</p>
        <ul>
          ${datesList}
        </ul>
        <p><strong>Book immediately:</strong></p>
        <p><a href="${reservationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Go to Reservation System</a></p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This is an automated alert from your Czech visa reservation monitoring bot.
          <br>
          Time: ${new Date().toLocaleString()}
        </p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('✓ Email notification sent successfully');

  } catch (error) {
    console.error('✗ Failed to send email notification:', error.message);
  }
}

module.exports = { sendEmailNotification };
