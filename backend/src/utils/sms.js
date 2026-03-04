import env from '../config/env.js';

const formatBDPhone = (phone) => {
  if (phone.startsWith('01')) return '+880' + phone.substring(1);
  if (phone.startsWith('8801')) return '+' + phone;
  if (!phone.startsWith('+')) return '+880' + phone;
  return phone;
};

export const sendSMS = async (to, message) => {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    console.warn(`[SMS STUB] To: ${to} | Message: ${message}`);
    return true;
  }

  const twilio = (await import('twilio')).default;
  const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

  await client.messages.create({
    body: message,
    from: env.TWILIO_PHONE_NUMBER,
    to: formatBDPhone(to),
  });
  return true;
};
