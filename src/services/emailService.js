const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/appError');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Verification token yaratish
  async createVerificationToken(user) {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    user.verificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    
    await user.save();
    
    return verificationToken;
  }

  // Email tasdiqlash xatini yuborish
  async sendVerificationEmail(user, verificationToken) {
    const verificationURL = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    const message = {
      from: `"Books Marketplace" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Email manzilingizni tasdiqlang',
      html: `
        <h1>Xush kelibsiz!</h1>
        <p>Email manzilingizni tasdiqlash uchun quyidagi havolani bosing:</p>
        <a href="${verificationURL}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        ">Email manzilni tasdiqlash</a>
        <p>Agar siz ro'yxatdan o'tmagan bo'lsangiz, ushbu xatni e'tiborsiz qoldiring.</p>
        <p>Havola 24 soat davomida amal qiladi.</p>
      `
    };

    await this.transporter.sendMail(message);
  }

  // Parolni tiklash uchun token yaratish
  async createPasswordResetToken(user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    user.resetPasswordExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 soat
    
    await user.save();
    
    return resetToken;
  }

  // Parolni tiklash xatini yuborish
  async sendPasswordResetEmail(user, resetToken) {
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = {
      from: `"Books Marketplace" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Parolni tiklash',
      html: `
        <h1>Parolni tiklash</h1>
        <p>Parolingizni tiklash uchun quyidagi havolani bosing:</p>
        <a href="${resetURL}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        ">Parolni tiklash</a>
        <p>Agar siz parolni tiklashni so'ramagan bo'lsangiz, ushbu xatni e'tiborsiz qoldiring.</p>
        <p>Havola 24 soat davomida amal qiladi.</p>
      `
    };

    await this.transporter.sendMail(message);
  }

  // Buyurtma tasdiqlash xatini yuborish
  async sendOrderConfirmation(user, order) {
    const message = {
      from: `"Books Marketplace" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Buyurtmangiz tasdiqlandi',
      html: `
        <h1>Buyurtmangiz qabul qilindi!</h1>
        <p>Buyurtma raqami: ${order._id}</p>
        <h2>Buyurtma tafsilotlari:</h2>
        <ul>
          ${order.items.map(item => `
            <li>
              ${item.book.title} - ${item.quantity} dona
              <br>
              Narxi: $${item.price}
            </li>
          `).join('')}
        </ul>
        <p>Umumiy summa: $${order.totalAmount}</p>
        <p>To'lov usuli: ${order.paymentMethod}</p>
        <p>Buyurtma holati: ${order.status}</p>
      `
    };

    await this.transporter.sendMail(message);
  }

  // Email verifikatsiyasini tekshirish
  async verifyEmail(token) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      verificationToken: hashedToken
    });

    if (!user) {
      throw new AppError('Invalid verification token', 400);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return user;
  }
}

module.exports = new EmailService();
