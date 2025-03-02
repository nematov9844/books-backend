// src/routes/verifyEmail.js
const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { validateEmail, validatePassword } = require('../middlewares/validationMiddleware');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Email
 *   description: Email verification endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EmailRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *     PasswordReset:
 *       type: object
 *       required:
 *         - password
 *         - passwordConfirm
 *       properties:
 *         password:
 *           type: string
 *           format: password
 *           description: New password
 *         passwordConfirm:
 *           type: string
 *           format: password
 *           description: Confirm new password
 */

/**
 * @swagger
 * /verify-email/{token}:
 *   get:
 *     summary: Verify email address
 *     tags: [Email]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.get('/verify-email/:token', emailController.verifyEmail);


/**
 * @swagger
 * /forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailRequest'
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: Email not found
 */
router.post('/forgot-password', validateEmail, emailController.forgotPassword);


/**
 * @swagger
 * /resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailRequest'
 *     responses:
 *       200:
 *         description: Verification email resent
 *       400:
 *         description: Email already verified
 *       404:
 *         description: Email not found
 */
router.post('/resend-verification', validateEmail, emailController.resendVerificationEmail);

module.exports = router;
