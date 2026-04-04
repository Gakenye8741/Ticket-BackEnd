import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendNotificationEmail = async (
  email: string,
  subject: string,
  firstName: string | null,
  message: string,
  html?: string
): Promise<boolean> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Recommended for port 587 on cloud hosting
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Adding these to prevent the "Connection Timeout" on Render
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000,   // 30 seconds
      socketTimeout: 45000,     // 45 seconds
      tls: {
        rejectUnauthorized: false // Helps bypass Render's network restrictions
      }
    });

    const mailOptions = {
      from: `"TicketStream Events" <${process.env.EMAIL_SENDER}>`,
      to: email,
      subject,
      text: message,
      html: html
        ? html
        : `
        <div style="font-family: Arial, sans-serif;">
          <p>Hello ${firstName ?? "User"},</p>
          <p>${message}</p>
        </div>
      `,
    };

    const mailResponse = await transporter.sendMail(mailOptions);

    if (mailResponse.accepted.length > 0) {
      console.log(
        `[MAILER SUCCESS] Email accepted by SMTP server for ${email}`
      );
      return true;
    }

    if (mailResponse.rejected.length > 0) {
      console.error(
        `[MAILER FAILURE] Email rejected by SMTP server for ${email}`,
        mailResponse.rejected
      );
      return false;
    }

    console.error(
      `[MAILER ERROR] Unknown SMTP response for ${email}`,
      mailResponse
    );
    return false;
  } catch (error) {
    console.error(
      `[MAILER EXCEPTION] Failed to send email to ${email}`,
      error
    );
    return false;
  }
};