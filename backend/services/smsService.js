import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (to, message) => {
  try {
    //! Format Bangladeshi phone numbers
    let formatterPhone = to;
    if (to.startsWith("01")) {
      formatterPhone = "+880" + to.substring(1); // Convert 01XXXXXXXXX to +8801XXXXXXXXX
    } else if (to.startsWith("8801")) {
      formatterPhone = "+" + to; // Already in correct format
    } else if (!to.startsWith("+")) {
      formatterPhone = "+880" + to; // Add +880 if missing
    }

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formatterPhone,
    });
    return true;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw new Error("Failed to send SMS");
  }
};
