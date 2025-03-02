const PaymentService = require('../services/paymentService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Checkout session yaratish
exports.createCheckoutSession = catchAsync(async (req, res) => {
  const { items } = req.body;
  
  if (!items || !items.length) {
    throw new AppError('No items provided', 400);
  }

  const session = await PaymentService.createCheckoutSession(req.user._id, items);

  res.status(200).json({
    status: 'success',
    data: {
      sessionId: session.id,
      url: session.url
    }
  });
});

// Stripe webhook
exports.handleWebhook = catchAsync(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    throw new AppError(`Webhook Error: ${err.message}`, 400);
  }

  await PaymentService.handleWebhook(event);

  res.status(200).json({ received: true });
});

// To'lov holatini tekshirish
exports.checkPaymentStatus = catchAsync(async (req, res) => {
  const { sessionId } = req.params;

  const paymentStatus = await PaymentService.checkPaymentStatus(sessionId);

  res.status(200).json({
    status: 'success',
    data: paymentStatus
  });
});

// To'lovni qaytarish
exports.refundPayment = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const refund = await PaymentService.refundPayment(orderId);

  res.status(200).json({
    status: 'success',
    data: refund
  });
}); 