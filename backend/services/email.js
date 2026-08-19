const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

export async function sendEmail({ to, subject, text }) {
  if (!RESEND_API_KEY) {
    console.log('EMAIL NOT CONFIGURED - Would send:');
    console.log(`From: ${EMAIL_FROM}`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    return { messageId: 'console-log' };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [to],
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Resend error ${res.status}: ${res.statusText}`);
  }

  const result = await res.json();
  console.log(`Email sent to ${to} (id: ${result.id})`);
  return result;
}

export async function sendPasswordReset(to, resetLink) {
  const subject = 'Reset your password';
  const text = `click the link to reset your password: ${resetLink}\n\nif you didnt request this, ignore this email.`;
  return sendEmail({ to, subject, text });
}