import nodemailer from 'nodemailer';
import { emailConfig } from '../config/email';

// Create a transporter object
const transporter = nodemailer.createTransport(emailConfig.smtp);

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP Configuration Error:', error);
  } else {
    console.log('SMTP Server is ready to take our messages');
  }
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    console.log('Attempting to send email to:', to);
    console.log('Using SMTP config:', {
      host: emailConfig.smtp.host,
      port: emailConfig.smtp.port,
      secure: emailConfig.smtp.secure,
      user: emailConfig.smtp.auth.user
    });

    const mailOptions = {
      from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
      to,
      subject,
      html,
    };

    console.log('Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Detailed error sending email:', {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
    throw error;
  }
} 