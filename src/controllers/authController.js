const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Token yaratish yordamchi funksiyasi
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Foydalanuvchini ro'yxatdan o'tkazish va tasdiqlash emailini yuborish
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi va tasdiqlash emaili yuborildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Email allaqachon ro'yxatdan o'tgan yoki boshqa xatolik.
 *       500:
 *         description: Server xatosi.
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    user = await User.create({ name, email, phone, password });
    
    // Token yaratish
    const token = generateToken(user);
    
    // Email orqali tasdiqlash xabari yuborish
    await emailService.sendVerificationEmail(user.email, token);
  
    res.status(201).json({ message: 'User registered. Please verify your email.', token });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Foydalanuvchini tizimga kirish (login)
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Tizimga kirish muvaffaqiyatli bo'ldi va token qaytarildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 data:
 *                   type: object
 *                   description: Foydalanuvchi ma'lumotlari (parol maydoni chiqarilmagan)
 *       400:
 *         description: Noto'g'ri login ma'lumotlari yoki email tasdiqlanmagan.
 *       500:
 *         description: Server xatosi.
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified) return res.status(400).json({ message: 'Email not verified' });

    const token = generateToken(user);
    res.status(200).json({ token, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Foydalanuvchining parolini tiklash uchun reset tokenini yuborish
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Parolni tiklash bo'yicha ko'rsatmalar email orqali yuborildi.
 *       400:
 *         description: Foydalanuvchi topilmadi yoki boshqa xatolik.
 *       500:
 *         description: Server xatosi.
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    
    // Reset token yaratish
    const resetToken = generateToken(user);
    // Masalan, reset tokenni email orqali yuborish
    // await emailService.sendResetPasswordEmail(user.email, resetToken);
    
    res.status(200).json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Parolni tiklash
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Parol muvaffaqiyatli yangilandi.
 *       400:
 *         description: Token noto'g'ri yoki muddati o'tgan.
 *       500:
 *         description: Server xatosi.
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: 'Invalid token' });
    
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/social-auth-callback:
 *   get:
 *     summary: Ijtimoiy tarmoqlar orqali autentifikatsiya callback
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Ijtimoiy autentifikatsiya muvaffaqiyatli yakunlandi, token qaytariladi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       500:
 *         description: Server xatosi.
 */
exports.socialAuthCallback = (req, res) => {
  const token = generateToken(req.user);
  res.status(200).json({ token });
};
