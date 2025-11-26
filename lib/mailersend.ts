/**
 * MailerSend Integration
 * 
 * This module provides functions for sending emails via MailerSend API.
 * 
 * Required environment variables:
 * - MAILERSEND_API_KEY: Your MailerSend API key
 * - MAILERSEND_FROM_EMAIL: The email address to send from
 * - MAILERSEND_FROM_NAME: The name to display as sender
 */

interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text: string;
}

interface WelcomeEmailParams {
  toEmail: string;
  toName?: string;
  tier: 'free' | 'premium';
  zipCode: string;
}

const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY;
const MAILERSEND_FROM_EMAIL = process.env.MAILERSEND_FROM_EMAIL || 'deals@danknetwork.com';
const MAILERSEND_FROM_NAME = process.env.MAILERSEND_FROM_NAME || 'Daily Dispo Deals';

/**
 * Send an email via MailerSend API
 */
async function sendEmail({ to, toName, subject, html, text }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!MAILERSEND_API_KEY) {
    console.error('[MailerSend] API key not configured');
    return { success: false, error: 'MailerSend API key not configured' };
  }

  try {
    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERSEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: {
          email: MAILERSEND_FROM_EMAIL,
          name: MAILERSEND_FROM_NAME,
        },
        to: [
          {
            email: to,
            name: toName || to,
          },
        ],
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[MailerSend] Error sending email:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return { 
        success: false, 
        error: `Failed to send email: ${response.statusText}` 
      };
    }

    console.log('[MailerSend] Email sent successfully to:', to);
    return { success: true };
  } catch (error) {
    console.error('[MailerSend] Exception while sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send a welcome email to a new subscriber
 */
export async function sendWelcomeEmail({ 
  toEmail, 
  toName, 
  tier, 
  zipCode 
}: WelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  const firstName = toName?.split(' ')[0] || 'there';
  const isFree = tier === 'free';

  const subject = `🔥 Welcome to Daily Dispo Deals${isFree ? '' : ' Premium'}!`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #ffffff;
      background-color: #000000;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #00ff00;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #ff6b00;
      font-size: 18px;
    }
    .content {
      background-color: #0a0a0a;
      border: 2px solid #00ff00;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 20px;
    }
    .greeting {
      font-size: 24px;
      font-weight: bold;
      color: #00ff00;
      margin-bottom: 20px;
    }
    .badge {
      display: inline-block;
      background-color: ${isFree ? '#00ff00' : '#ff6b00'};
      color: #000000;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .feature-list {
      list-style: none;
      padding: 0;
      margin: 20px 0;
    }
    .feature-list li {
      padding: 10px 0;
      border-bottom: 1px solid rgba(0, 255, 0, 0.2);
    }
    .feature-list li:last-child {
      border-bottom: none;
    }
    .cta-button {
      display: inline-block;
      background-color: #00ff00;
      color: #000000;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #666666;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #333333;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌿 Daily Dispo Deals</div>
      <div class="subtitle">Michigan's Smartest Way to Shop Weed</div>
    </div>

    <div class="content">
      <div class="greeting">Hey ${firstName}! 👋</div>
      
      <div class="badge">${isFree ? 'FREE PLAN' : 'PREMIUM PLAN - $4.20/mo'}</div>
      
      <p>Welcome to Daily Dispo Deals! You're about to start saving serious money on cannabis in Michigan.</p>
      
      <p><strong>Here's what you can expect:</strong></p>
      <ul class="feature-list">
        ${isFree ? `
        <li>✅ <strong>Weekly Deal Roundups</strong> - Top deals across Michigan</li>
        <li>✅ <strong>ZIP-Based Targeting</strong> - Deals near ${zipCode}</li>
        <li>✅ <strong>Value Scores</strong> - AI-ranked by THC-per-dollar</li>
        ` : `
        <li>✅ <strong>Daily Deals</strong> - Fresh deals every morning</li>
        <li>✅ <strong>ZIP-Based Targeting</strong> - Deals within 15 miles of ${zipCode}</li>
        <li>✅ <strong>Top 10 Daily Deals</strong> - The absolute best value</li>
        <li>✅ <strong>Price Drop Alerts</strong> - Never miss a steal</li>
        <li>✅ <strong>Brand Preferences</strong> - Custom filtered for you</li>
        `}
      </ul>

      <p><strong>How it works:</strong></p>
      <p>1. 🤖 Our AI scans Michigan dispensary menus daily<br>
      2. 📊 We rank deals by THC-per-dollar value<br>
      3. 📬 You get a clean email with the best deals<br>
      4. 💰 You save money and time</p>

      ${!isFree ? `
      <p style="color: #ff6b00; font-weight: bold;">
        Thank you for supporting Daily Dispo Deals with Premium! 🙏
      </p>
      ` : `
      <p style="margin-top: 30px;">
        <strong>Want more deals?</strong> Upgrade to Premium for just <span style="color: #00ff00;">$4.20/mo</span> and get:
        <ul>
          <li>Daily emails (not weekly)</li>
          <li>10+ deals per day</li>
          <li>Earlier notifications</li>
          <li>Custom brand filters</li>
        </ul>
      </p>
      `}
    </div>

    <div style="text-align: center;">
      <p style="color: #999999; font-size: 14px;">
        Your first ${isFree ? 'weekly' : 'daily'} email is coming soon!
      </p>
    </div>

    <div class="footer">
      <p><strong>Daily Dispo Deals</strong> by Dank Network</p>
      <p>Not a dispensary. For informational purposes only.<br>
      21+ only. Please consume responsibly and follow Michigan laws.</p>
      <p style="margin-top: 10px;">
        Questions? Reply to this email anytime.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Hey ${firstName}!

Welcome to Daily Dispo Deals! You're on the ${tier.toUpperCase()} plan.

${isFree ? `
You'll receive weekly roundups of the best dispensary deals in Michigan, targeted to your area near ZIP ${zipCode}.
` : `
You'll receive daily emails with the top 10 deals in Michigan, targeted within 15 miles of ZIP ${zipCode}.

Thank you for supporting Daily Dispo Deals with Premium!
`}

How it works:
1. Our AI scans Michigan dispensary menus daily
2. We rank deals by THC-per-dollar value
3. You get a clean email with the best deals
4. You save money and time

Your first ${isFree ? 'weekly' : 'daily'} email is coming soon!

---
Daily Dispo Deals by Dank Network
Not a dispensary. For informational purposes only.
21+ only. Please consume responsibly and follow Michigan laws.

Questions? Reply to this email anytime.
  `.trim();

  return sendEmail({
    to: toEmail,
    toName,
    subject,
    html,
    text,
  });
}

/**
 * Configuration check - returns true if MailerSend is properly configured
 */
export function isMailerSendConfigured(): boolean {
  return !!(MAILERSEND_API_KEY && MAILERSEND_FROM_EMAIL);
}

