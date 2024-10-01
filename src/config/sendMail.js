import nodemailer from "nodemailer";

const sendMail = async ({ email, html, subject, text }) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_NAME,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    const info = await transporter.sendMail({
        from: '"Melodi" <chihieuutt20@gmail.com>',
        to: email,
        subject: subject,
        text: text,
        html: html
    });

    return info;
}

export default sendMail;