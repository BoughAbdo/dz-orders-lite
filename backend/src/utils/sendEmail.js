// backend/src/utils/sendEmail.js
const SibApiV3Sdk = require('@getbrevo/brevo');

const sendEmail = async ({ to, subject, html }) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const apiKey = apiInstance.authentications['apiKey'];
    
    // استخدام مفتاح API
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = {
      name: 'طلبيات',
      email: process.env.EMAIL_FROM || 'talabiyat.app@gmail.com',
    };
    sendSmtpEmail.to = [{ email: to }];

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully via Brevo API:', response);
    return response;
  } catch (error) {
    console.error('Brevo API Error:', error.response ? error.response.body : error.message);
    throw new Error('تعذر إرسال البريد الإلكتروني عبر API');
  }
};

module.exports = sendEmail;