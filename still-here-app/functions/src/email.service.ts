// Email service using SendGrid for sending alerts
import * as sgMail from '@sendgrid/mail';
import { EmailAlertParams } from './types';

// Initialize SendGrid with API key from environment variable
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
sgMail.setApiKey(SENDGRID_API_KEY);

const FROM_EMAIL = 'alerts@stillhereapp.com'; // Must be verified in SendGrid

/**
 * Send alert email to emergency contact
 */
export async function sendAlertEmail(params: EmailAlertParams): Promise<void> {
  const {
    contactName,
    contactEmail,
    userName,
    lastCheckInDate,
    personalMessage,
    userEmail,
    userPhone
  } = params;

  // Format last check-in date
  const lastCheckInText = lastCheckInDate
    ? lastCheckInDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    : 'Unknown';

  // Plain text version
  const textContent = `
Hi ${contactName},

This is an automated message from the Still Here app.

${userName} has not checked in for 2 consecutive days.
Last check-in: ${lastCheckInText}

This may be nothing, but they set you as an emergency contact in case they couldn't check in.

Please reach out to confirm they're okay:
${userEmail ? `Email: ${userEmail}` : ''}
${userPhone ? `Phone: ${userPhone}` : ''}

${personalMessage ? `\nPersonal message from ${userName}:\n"${personalMessage}"` : ''}

---
Sent by Still Here App
www.stillhereapp.com

If this is a false alarm, please ask ${userName} to check in or enable Vacation Mode.
  `.trim();

  // HTML version with styling
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: #4A90E2;
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0;
      opacity: 0.9;
      font-size: 16px;
    }
    .content {
      padding: 30px 20px;
    }
    .alert-box {
      background: #FFF3CD;
      border-left: 4px solid #FFC107;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .alert-box strong {
      display: block;
      font-size: 18px;
      margin-bottom: 10px;
      color: #856404;
    }
    .alert-box p {
      margin: 5px 0;
      color: #856404;
    }
    .contact-info {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .contact-info h3 {
      margin: 0 0 15px;
      font-size: 18px;
      color: #333;
    }
    .contact-item {
      margin: 10px 0;
      display: flex;
      align-items: center;
    }
    .contact-item span {
      font-size: 20px;
      margin-right: 10px;
    }
    .contact-item a {
      color: #4A90E2;
      text-decoration: none;
      font-weight: 500;
    }
    .message-box {
      background: #e3f2fd;
      border-left: 4px solid #2196F3;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .message-box strong {
      display: block;
      margin-bottom: 10px;
      color: #1976D2;
    }
    .message-box p {
      margin: 0;
      font-style: italic;
      color: #1976D2;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 14px;
      background: #f8f9fa;
      border-top: 1px solid #e0e0e0;
    }
    .footer a {
      color: #4A90E2;
      text-decoration: none;
      margin: 0 10px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #4A90E2;
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      margin: 10px 5px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❤️ Still Here</h1>
      <p>Check-in Alert</p>
    </div>

    <div class="content">
      <p>Hi ${contactName},</p>

      <div class="alert-box">
        <strong>⚠️ ${userName} has not checked in for 2 consecutive days</strong>
        <p>Last check-in: <strong>${lastCheckInText}</strong></p>
      </div>

      <p>This may be nothing, but they set you as an emergency contact in case they couldn't check in.</p>

      <div class="contact-info">
        <h3>Please reach out to confirm they're okay:</h3>

        ${userEmail ? `
        <div class="contact-item">
          <span>📧</span>
          <a href="mailto:${userEmail}">${userEmail}</a>
        </div>
        ` : ''}

        ${userPhone ? `
        <div class="contact-item">
          <span>📞</span>
          <a href="tel:${userPhone}">${userPhone}</a>
        </div>
        ` : ''}

        ${!userEmail && !userPhone ? `
        <p>No contact information was provided. Please use your personal contact details for ${userName}.</p>
        ` : ''}
      </div>

      ${personalMessage ? `
      <div class="message-box">
        <strong>Personal message from ${userName}:</strong>
        <p>"${personalMessage}"</p>
      </div>
      ` : ''}

      <p style="margin-top: 20px; color: #666; font-size: 14px;">
        <strong>What happens next?</strong><br>
        Once you've confirmed ${userName} is safe, please ask them to:
        <ul>
          <li>Check in on the Still Here app</li>
          <li>Enable Vacation Mode if they're traveling</li>
          <li>Update their emergency contacts if needed</li>
        </ul>
      </p>
    </div>

    <div class="footer">
      <p>Sent by <a href="https://stillhereapp.com">Still Here App</a></p>
      <p>
        <a href="https://stillhereapp.com/false-alarm">Report False Alarm</a> |
        <a href="https://stillhereapp.com/help">Get Help</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        This email was sent because ${userName} added you as an emergency contact.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const msg = {
    to: contactEmail,
    from: {
      email: FROM_EMAIL,
      name: 'Still Here App'
    },
    subject: `[Still Here App] Check-in Alert for ${userName}`,
    text: textContent,
    html: htmlContent,
    // Custom tracking (optional)
    trackingSettings: {
      clickTracking: {
        enable: false, // Respect privacy
      },
      openTracking: {
        enable: false, // Respect privacy
      },
    },
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Alert email sent to ${contactEmail} for user ${userName}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${contactEmail}:`, error);
    throw error;
  }
}

/**
 * Send welcome email after user signs up (optional)
 */
export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
  const msg = {
    to: userEmail,
    from: {
      email: FROM_EMAIL,
      name: 'Still Here App'
    },
    subject: 'Welcome to Still Here! 👋',
    text: `
Hi ${userName},

Welcome to Still Here! We're glad you're here.

Your safety matters. Here's how we've got your back:
✓ Check in daily (takes 2 seconds)
✓ We watch for missed check-ins
✓ Your emergency contacts get notified if needed

Need help? Reply to this email or visit stillhereapp.com/help

Stay safe,
The Still Here Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4A90E2; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .feature { margin: 15px 0; padding-left: 30px; position: relative; }
    .feature::before { content: "✓"; position: absolute; left: 0; color: #4A90E2; font-weight: bold; font-size: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❤️ Welcome to Still Here!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>We're glad you're here. Your safety matters, and we've got your back.</p>

      <h3>How Still Here works:</h3>
      <div class="feature">Check in daily (takes 2 seconds)</div>
      <div class="feature">We watch for missed check-ins</div>
      <div class="feature">Your emergency contacts get notified if needed</div>

      <p style="margin-top: 30px;">Need help? Reply to this email or visit <a href="https://stillhereapp.com/help">our help center</a>.</p>

      <p>Stay safe,<br>The Still Here Team</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Welcome email sent to ${userEmail}`);
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${userEmail}:`, error);
    // Don't throw - welcome email is non-critical
  }
}
