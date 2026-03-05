import nodemailer from 'nodemailer';
import env from '../config/env.js';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (env.EMAIL_USER && env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
  }

  return transporter;
};

export const sendEmail = async (to, subject, text, html = null) => {
  const t = getTransporter();
  if (!t) {
    console.warn(`[EMAIL STUB] To: ${to} | Subject: ${subject} | Body: ${text}`);
    return true;
  }

  await t.sendMail({
    from: env.EMAIL_USER,
    to,
    subject,
    text,
    ...(html && { html }),
  });
  return true;
};
