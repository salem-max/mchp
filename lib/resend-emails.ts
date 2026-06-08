/**
 * Email service stub — resend is not installed and not required by the task.
 * If email sending is needed later, install `resend` and replace this stub.
 */

function getResend() {
  console.warn('[resend-emails] Resend is not installed. Email sending is disabled.');
  return null;
}

export async function sendMagicLinkEmail({
  to,
  token,
  baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  subject = 'Your Malaysia Co (Maintenance Services) sign-in link',
  messageHeadline = 'Sign in to Malaysia Co (Maintenance Services)',
  messageBody = 'Click the button below to sign in. This link expires in 30 minutes.',
}: {
  to: string;
  token: string;
  baseUrl?: string;
  subject?: string;
  messageHeadline?: string;
  messageBody?: string;
}) {
  const verifyUrl = `${baseUrl}/api/auth/verify-magic?token=${token}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; color: #111827;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 40px 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">${messageHeadline}</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Use the link below to sign in passwordlessly.</p>
    </div>
    <div style="padding: 48px 32px;">
      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px; color: #374151;">Hi there,</p>
      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 32px; color: #374151;">${messageBody}</p>
      <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.2s;">Sign in securely</a>
      <p style="font-size: 14px; line-height: 1.5; margin: 32px 0 0; color: #6b7280; background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #ff6b35;">If you didn't request this email, you can ignore it.</p>
    </div>
    <div style="background: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 14px; color: #6b7280; margin: 0;">Need help? <a href="mailto:support@fixswift.com" style="color: #ff6b35;">Contact support</a></p>
      <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0;">© 2024 Malaysia Co (Maintenance Services). All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  try {
    const client = getResend();
    if (!client) {
      console.warn('[resend-emails] Skipped sending email to', to);
      return;
    }
    await (client as any).emails.send({
      from: 'Malaysia Co (Maintenance Services) <no-reply@fixswift.com>',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email send failed:', error);
    throw new Error('Failed to send verification email');
  }
}

