"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmails = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmails = async (email, subject, message, firstName, lastName) => {
    try {
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            secure: true,
            auth: {
                user: process.env.EMAIL_SENDER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        const mailOptions = {
            from: `"Your App Name" <${process.env.EMAIL_SENDER}>`,
            to: email,
            subject,
            text: `${message}`,
            html: `
        <html>
          <head>
            <style>
              .email-container {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                padding: 20px;
                border-radius: 5px;
                color: #333;
              }
              .header {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 10px;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">${subject}</div>
              <p>Hello ${firstName} ${lastName},</p>
              <p>${message}</p>
            </div>
          </body>
        </html>
      `,
        };
        const mailRes = await transporter.sendMail(mailOptions);
        if (mailRes.accepted.length > 0) {
            return 'Notification email sent successfully';
        }
        else if (mailRes.rejected.length > 0) {
            return 'Notification email not sent, please try again';
        }
        else {
            return 'Email server error';
        }
    }
    catch (error) {
        console.error('Email sending error:', error);
        return 'Email server error';
    }
};
exports.sendEmails = sendEmails;
