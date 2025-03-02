const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateOrder } = require('../middlewares/validationMiddleware');

/**
 * @swagger
 * /api/payments/checkout:
 *   post:
 *     summary: Create a checkout session
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - book
 *                     - quantity
 *                   properties:
 *                     book:
 *                       type: string
 *                       description: Book ID
 *                     quantity:
 *                       type: number
 *                       minimum: 1
 */
router.post('/checkout', authMiddleware, validateOrder, paymentController.createCheckoutSession);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Handle Stripe webhook
 *     tags: [Payments]
 */
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

/**
 * @swagger
 * /api/payments/status/{sessionId}:
 *   get:
 *     summary: Check payment status
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/status/:sessionId', authMiddleware, paymentController.checkPaymentStatus);

/**
 * @swagger
 * /api/payments/refund/{orderId}:
 *   post:
 *     summary: Refund a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/refund/:orderId', authMiddleware, paymentController.refundPayment);

module.exports = router; 