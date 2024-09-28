import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name); // Crear una instancia de Logger

    constructor() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }

    async sendOtpEmail(to: string, otp: string): Promise<void> {
        const msg = {
            to,
            from: 'dev.test.reinaldo@gmail.com', // Debe ser un correo verificado en SendGrid
            subject: 'Your OTP Code',
            text: `Your OTP code is: ${otp}`,
            html: `<strong>Your OTP code is: ${otp}</strong>`,
        };

        try {
            await sgMail.send(msg);
            this.logger.log(`Email sent successfully to ${to}`);
            // console.log('SendGrid Message:', msg); // Esto muestra el mensaje en la consola
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}`, error.stack);
            if (error.response) {
                this.logger.error(`SendGrid response: ${JSON.stringify(error.response.body)}`);
            }
            throw error;
        }

    }

    async sendRecoveryEmail(email: string, token: string) {
        const msg = {
            to: email,
            from: 'no-reply@yourdomain.com',
            subject: 'Password Recovery',
            text: `Your password recovery token is: ${token}`,
            html: `<strong>Your password recovery token is: ${token}</strong>`,
        };

        try {
            await sgMail.send(msg);
            this.logger.log(`Password recovery email sent to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send password recovery email to ${email}`, error);
            throw new Error('Failed to send recovery email.');
        }
    }
}
