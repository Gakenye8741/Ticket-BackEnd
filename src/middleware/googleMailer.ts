import nodeMailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendNotificationEmail = async (email: string, subject: string, firstName: string | null, message: string, html?: string) => {
    try {
        const transporter = nodeMailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            secure: true,
            auth: {
                user: process.env.EMAIL_SENDER,
                pass: process.env.EMAIL_PASSWORD,
        },
        });

        const mailOptions = {
            from:  `"TicketStream Events" <${process.env.EMAIL_SENDER}>`, // sender address
            to: email,
            subject: subject, // Subject line
            text: `${message}\n`, // plain text body
            html: `<html>
            <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                }
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                h2 {
                    color: #333;
                }
                p {
                    line-height: 1.6;
                    margin: 10px 0;
                }
            </style>
            </head>
            <body>
                    <p>${message}</p>
                </div>
            <body>`
        }

        const mailResponse = await transporter.sendMail(mailOptions);
        
        if (mailResponse.accepted.length > 0) {
            return "Notification email sent successfully";
        }else if (mailResponse.rejected.length > 0) {
            return "Notification email not sent, please try again";
        }else{
            return "Email server error"
        }

    } catch (error) {
        return `Email server error ${error}`;
    }
}