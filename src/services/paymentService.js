const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Book = require('../models/Book');
const Order = require('../models/Order');
const AppError = require('../utils/appError');

class PaymentService {
  // To'lov sessiyasini yaratish
  static async createCheckoutSession(userId, items) {
    // Kitoblarni bazadan olish va tekshirish
    const bookIds = items.map(item => item.book);
    const books = await Book.find({ _id: { $in: bookIds } });

    if (books.length !== items.length) {
      throw new AppError('Some books are not available', 400);
    }

    // Line items yaratish
    const lineItems = books.map((book, index) => {
      const orderItem = items[index];
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: book.title,
            description: book.description,
            images: [book.coverImage]
          },
          unit_amount: Math.round(book.price * 100) // Stripe cents bilan ishlaydi
        },
        quantity: orderItem.quantity
      };
    });

    // Checkout session yaratish
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      customer_email: req.user.email,
      client_reference_id: userId,
      line_items: lineItems,
      metadata: {
        bookIds: bookIds.join(','),
        quantities: items.map(item => item.quantity).join(',')
      }
    });

    return session;
  }

  // To'lov muvaffaqiyatli bo'lganda
  static async handleSuccessfulPayment(session) {
    const userId = session.client_reference_id;
    const bookIds = session.metadata.bookIds.split(',');
    const quantities = session.metadata.quantities.split(',').map(Number);

    // Order yaratish
    const order = await Order.create({
      user: userId,
      items: bookIds.map((bookId, index) => ({
        book: bookId,
        quantity: quantities[index],
        price: session.amount_total / 100 // Cents dan dollarga o'tkazish
      })),
      totalAmount: session.amount_total / 100,
      paymentMethod: 'credit_card',
      paymentStatus: 'completed',
      status: 'processing',
      transactionId: session.payment_intent
    });

    return order;
  }

  // To'lov webhook handler
  static async handleWebhook(event) {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await this.handleSuccessfulPayment(session);
        break;
      
      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object;
        console.log('Payment failed:', paymentIntent.id);
        // To'lov muvaffaqiyatsiz bo'lganda qo'shimcha logika
        break;
    }
  }

  // To'lov holatini tekshirish
  static async checkPaymentStatus(sessionId) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      status: session.payment_status,
      orderId: session.metadata.orderId
    };
  }

  // To'lovni qaytarish (refund)
  static async refundPayment(orderId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.paymentStatus !== 'completed') {
      throw new AppError('Payment cannot be refunded', 400);
    }

    const refund = await stripe.refunds.create({
      payment_intent: order.transactionId,
      reason: 'requested_by_customer'
    });

    // Order statusini yangilash
    order.paymentStatus = 'refunded';
    order.status = 'cancelled';
    await order.save();

    return refund;
  }
}

module.exports = PaymentService; 