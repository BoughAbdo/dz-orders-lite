// backend/src/utils/sendEmail.js
const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'طلبيات <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API Error:', data);
      throw new Error(data.message || 'فشل إرسال البريد');
    }

    console.log('Email sent successfully via Resend:', data);
    return data;
  } catch (error) {
    console.error('SendEmail Error:', error.message);
    throw new Error('تعذر إرسال البريد الإلكتروني');
  }
};

module.exports = sendEmail;