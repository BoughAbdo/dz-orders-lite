// backend/src/utils/sendEmail.js
const dns = require('dns');
const nodemailer = require('nodemailer');

dns.setDefaultResultOrder('ipv4first');

const sendEmail = async ({ to, subject, html }) => {
  const port = Number(process.env.EMAIL_PORT) || 587;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    family: 4,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      servername: process.env.EMAIL_HOST || 'smtp.gmail.com'
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html
  });
};

module.exports = sendEmail;