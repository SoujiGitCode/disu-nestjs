import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name); // Crear una instancia de Logger
    private readonly fromEmail: string;

    constructor(private readonly configService: ConfigService) {
        sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
        this.fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    }

    async sendOtpEmail(to: string, otp: string, name: string): Promise<void> {
        const msg = {
            to,
            from: this.fromEmail,
            templateId: 'd-52aa3b3ce5d847cf9a1e2603e2e933b3',
            dynamic_template_data: {
                name,
                otp_code: otp
            }
        };

        try {
            await sgMail.send(msg);
            this.logger.log(`Email sent successfully to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}`, error.stack);
            if (error.response) {
                this.logger.error(`SendGrid response: ${JSON.stringify(error.response.body)}`);
            }
            throw error;
        }
    }


    async sendRecoveryEmail(email: string, token: string): Promise<void> {
        const msg = {
            to: email,
            from: this.fromEmail,
            subject: 'Password Recovery',
            text: `Your password recovery token is: ${token}`,
            html: `<strong>Your password recovery token is: ${token}</strong>`,
        };

        try {
            await sgMail.send(msg);
            this.logger.log(`Password recovery email sent to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send password recovery email to ${email}`, error.stack);
            if (error.response) {
                this.logger.error(`SendGrid response: ${JSON.stringify(error.response.body)}`);
            }
            throw new Error('Failed to send recovery email.');
        }
    }
}
