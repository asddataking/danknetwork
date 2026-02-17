'use server';

import { Resend } from 'resend';

interface LeadData {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
  tier: string;
  website?: string;
}

export async function submitLead(data: LeadData) {
  // Validate required fields
  if (!data.businessName || !data.contactName || !data.email || !data.phone || !data.businessType || !data.tier) {
    return {
      success: false,
      error: 'All required fields must be filled out.',
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return {
      success: false,
      error: 'Please enter a valid email address.',
    };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const leadToEmail = process.env.LEAD_TO_EMAIL;
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  // Try Resend first
  if (resendApiKey && leadToEmail) {
    try {
      const resend = new Resend(resendApiKey);
      
      const emailBody = `
        <h2>New Partner Application</h2>
        <p><strong>Business Name:</strong> ${data.businessName}</p>
        <p><strong>Contact Name:</strong> ${data.contactName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Business Type:</strong> ${data.businessType}</p>
        <p><strong>Tier Interested In:</strong> ${data.tier}</p>
        ${data.website ? `<p><strong>Website/Instagram:</strong> ${data.website}</p>` : ''}
        <hr>
        <p><em>Submitted at: ${new Date().toLocaleString()}</em></p>
      `;

      await resend.emails.send({
        from: 'The Dank Network <noreply@thedanknetwork.com>',
        to: leadToEmail,
        subject: `New Partner Application: ${data.businessName}`,
        html: emailBody,
      });

      return {
        success: true,
        message: 'Application submitted successfully! We\'ll contact you soon.',
      };
    } catch (error) {
      console.error('Resend error:', error);
      // Fall through to Slack webhook
    }
  }

  // Try Slack webhook as fallback
  if (slackWebhookUrl) {
    try {
      const slackMessage = {
        text: 'New Partner Application',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'New Partner Application',
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Business Name:*\n${data.businessName}`,
              },
              {
                type: 'mrkdwn',
                text: `*Contact Name:*\n${data.contactName}`,
              },
              {
                type: 'mrkdwn',
                text: `*Email:*\n${data.email}`,
              },
              {
                type: 'mrkdwn',
                text: `*Phone:*\n${data.phone}`,
              },
              {
                type: 'mrkdwn',
                text: `*Business Type:*\n${data.businessType}`,
              },
              {
                type: 'mrkdwn',
                text: `*Tier:*\n${data.tier}`,
              },
            ],
          },
          ...(data.website ? [{
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Website/Instagram:*\n${data.website}`,
            },
          }] : []),
        ],
      };

      const response = await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage),
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Application submitted successfully! We\'ll contact you soon.',
        };
      }
    } catch (error) {
      console.error('Slack webhook error:', error);
      // Fall through to mailto
    }
  }

  // Final fallback: return mailto link
  const subject = encodeURIComponent(`Partner Application: ${data.businessName}`);
  const body = encodeURIComponent(`
Business Name: ${data.businessName}
Contact Name: ${data.contactName}
Email: ${data.email}
Phone: ${data.phone}
Business Type: ${data.businessType}
Tier Interested In: ${data.tier}
${data.website ? `Website/Instagram: ${data.website}` : ''}
  `.trim());

  return {
    success: false,
    error: 'Email service not configured. Please contact us directly.',
    mailto: `mailto:${leadToEmail || 'partners@thedanknetwork.com'}?subject=${subject}&body=${body}`,
  };
}
