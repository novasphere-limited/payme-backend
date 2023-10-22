import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Twilio from 'twilio';

@Injectable()
export class MessagingService {
  private transporter;
  private smsClient;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: parseInt(this.config.get('SMTP_PORT'), 10),
      auth: {
        user: this.config.get('SMTP_EMAIL'),
        pass: this.config.get('SMTP_PASSWORD'),
      },
    });
    this.smsClient = Twilio(
      this.config.get('TWILIO_ACCOUNT_SID'),
      this.config.get('TWILIO_AUTH_TOKEN'),
    );
  }

  async sendEmail(options: {
    email: string;
    subject: string;
    message: string;
  }) {
    const message = {
      from: this.config.get('SMTP_FROM_MAIL'),
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    try {
      const info = await this.transporter.sendMail(message);
      console.log('Message sent:', info.messageId);
      return info;
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendSms(to: string, message: string) {
    try {
      const result = await this.smsClient.messages.create({
        body: message,
        to,
        from: process.env.TWILIO_PHONE_NUMBER,
      });
      console.log('SMS sent:', result.sid);
      return result;
    } catch (error) {
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }
}
