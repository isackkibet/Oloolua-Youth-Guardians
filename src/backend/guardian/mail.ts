export function passwordResetEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.GUARDIAN_FROM_EMAIL;
}

export async function sendPasswordResetEmail(to: string, link: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.GUARDIAN_FROM_EMAIL;
  if (!key || !from) return;

  const safeLink = link.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'Reset your Guardian Hub password',
      text: `Use this link within 30 minutes to reset your Guardian Hub password:\n\n${link}\n\nIf you did not request this, ignore this message.`,
      html: `<p>Use this link within 30 minutes to reset your Guardian Hub password:</p><p><a href="${safeLink}">Reset password</a></p><p>If you did not request this, ignore this message.</p>`,
    }),
  });

  if (!response.ok) {
    console.error('[guardian] reset email failed:', response.status);
    throw new Error('reset email failed');
  }
}
