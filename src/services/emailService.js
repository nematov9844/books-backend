const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Gmail xizmatidan foydalanish
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendVerificationEmail = async (to, token) => {
  const verificationUrl = `http://localhost:5000/verify-email?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Email Verification',
    html: `<p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`,
  };
  
  return transporter.sendMail(mailOptions);
};

exports.sendResetPasswordEmail = async (to, token) => {
  const resetUrl = `http://localhost:5000/reset-password?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Reset Password',
    html: `<p>Reset your password by clicking <a href="${resetUrl}">here</a>.</p>`,
  };
  
  return transporter.sendMail(mailOptions);
};
