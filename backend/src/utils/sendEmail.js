// backend/src/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const port = Number(process.env.EMAIL_PORT) || 587;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html
  });
};

module.exports = sendEmail;