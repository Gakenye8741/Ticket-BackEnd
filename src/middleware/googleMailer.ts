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
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
      },
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
