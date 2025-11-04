const nodemailer = require('nodemailer');
const { User } = require('../models');

// Reads SMTP config from env:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
let transporter;
function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) {
    console.warn('emailService: SMTP not configured; emails will not be sent');
    return null;
  }
  transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465, // true for 465, false for other ports
    auth: { user, pass },
  });
  return transporter;
}

module.exports = {
  async sendMail({ to, subject, text, html, from }) {
    try {
      const t = getTransporter();
      if (!t) return { success: false, reason: 'SMTP_NOT_CONFIGURED' };
      const info = await t.sendMail({
        from: from || process.env.EMAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
      });
      return { success: true, info };
    } catch (err) {
      console.error('emailService.sendMail error:', err);
      return { success: false, reason: err.message };
    }
  },

  // Helper: send email to userId if user has email
  async sendMailToUserId(userId, { subject, text, html }) {
    if (!userId) return { success: false, reason: 'NO_USER' };
    const user = await User.findById(userId).lean();
    if (!user || !user.email) return { success: false, reason: 'NO_EMAIL' };
    return this.sendMail({ to: user.email, subject, text, html });
  },
};
