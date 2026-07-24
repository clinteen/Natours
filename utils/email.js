// const { MailtrapClient } = require("mailtrap");
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        ((this.firstname = user.name.split(' ')[0]),
            (this.url = url),
            (this.from = `Fyne Clinton <${process.env.EMAIL_SENDER}>`),
            // This is for production
            // (this.from = process.env.EMAIL_SENDER_PROD),
            (this.to = user.email));
    }

    // Create a transporter
    newTransporter() {
        if (process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject) {
        // 1.) Send HTML based on the template
        const htmlFile = pug.renderFile(
            `${__dirname}/../views/email/${template}.pug`,
            {
                firstname: this.firstname,
                url: this.url,
                subject: this.subject
            }
        );

        // 2.) Define the mail Options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: htmlFile,
            text: htmlToText.convert(htmlFile)
        };

        // Create a transport and send it
        await this.newTransporter().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family');
    }

    async sendPasswordReset() {
        await this.send(
            'passwordReset',
            'Your password reset token (valid for 10 minutes)'
        );
    }
};
