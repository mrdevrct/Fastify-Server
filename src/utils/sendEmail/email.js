const nodemailer = require("nodemailer");
const logger = require("../logger/logger");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: "TLSv1.2",
  },
});

const sendVerificationCode = async (email, code) => {
  await transporter.sendMail({
    from: `"Shop Server" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "کد تأیید ورود/ثبت‌نام",
    html: `<p>کد تأیید شما: <strong>${code}</strong></p><p>این کد تا 10 دقیقه معتبر است.</p>`,
  });
};

module.exports = { sendVerificationCode };
