// backend/src/utils/sendEmail.js
const dns = require('dns').promises;
const nodemailer = require('nodemailer');

const getSmtpHost = async () => {
  const hostname = process.env.EMAIL_HOST || 'smtp.gmail.com';

  try {
    const addresses = await dns.resolve4(hostname);

    if (addresses && addresses.length > 0) {
      return {
        host: addresses[0],
        servername: hostname
      };
    }
  } catch (error) {
    console.error('SMTP IPv4 resolve failed:', error.message);
  }

  return {
    host: hostname,
    servername: hostname
  };
};

const sendEmail = async ({ to, subject, html }) => {
  const port = Number(process.env.EMAIL_PORT) || 587;
  const { host, servername } = await getSmtpHost();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      servername
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