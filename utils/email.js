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

// const sendEmail = async (options) => {
//     //1.) Create a transporter
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASSWORD
//         }
//     });
//     //2.) Define the email options
//     const mailOptions = {
//         from: 'Fyne Clinton <hello@clinton.io>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//         // html
//     };
//     //3.) Send the email
//     await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;

// const { MailtrapClient } = require("mailtrap");

// const TOKEN = "<YOUR_API_TOKEN>";

// const client = new MailtrapClient({
//   token: TOKEN,
// });

// const sender = {
//   email: "hello@demomailtrap.co",
//   name: "Mailtrap Test",
// };
// const recipients = [
//   {
//     email: "clintonfyne1@gmail.com",
//   }
// ];

// client
//   .send({
//     from: sender,
//     to: recipients,
//     subject: "You are awesome!",
//     text: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//   })
//   .then(console.log, console.error);
