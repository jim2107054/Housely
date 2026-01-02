import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (toString, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toString,
      subject: subject,
      text: text, //! Plain text body, this will come from the function parameter
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

export default { sendEmail };
