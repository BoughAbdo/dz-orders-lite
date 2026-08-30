// backend/src/utils/sendEmail.js
const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'طلبيات',
          email: process.env.EMAIL_FROM || 'talabiyat.app@gmail.com',
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Brevo API Error:', data);
      throw new Error(data.message || 'فشل إرسال البريد');
    }

    console.log('Email sent successfully via Brevo API:', data);
    return data;
  } catch (error) {
    console.error('SendEmail Error:', error.message);
    throw new Error('تعذر إرسال البريد الإلكتروني');
  }
};

module.exports = sendEmail;