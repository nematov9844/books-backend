const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to a user']
  },
  items: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Order item must have a book']
    },
    quantity: {
      type: Number,
      required: [true, 'Order item must have a quantity'],
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: [true, 'Order item must have a price']
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Order must have a total amount']
  },
  shippingAddress: {
    street: {
      type: String,
      required: [true, 'Shipping address must have a street']
    },
    city: {
      type: String,
      required: [true, 'Shipping address must have a city']
    },
    state: {
      type: String,
      required: [true, 'Shipping address must have a state']
    },
    country: {
      type: String,
      required: [true, 'Shipping address must have a country']
    },
    zipCode: {
      type: String,
      required: [true, 'Shipping address must have a zip code']
    }
  },
  paymentMethod: {
    type: String,
    required: [true, 'Order must have a payment method'],
    enum: ['credit_card', 'debit_card', 'paypal']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: String,
  estimatedDeliveryDate: Date,
  notes: String,
  isGift: {
    type: Boolean,
    default: false
  },
  giftMessage: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indekslar
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

// Order yaratilganda stock kamaytiriladi
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Book = mongoose.model('Book');
    
    for (const item of this.items) {
      const book = await Book.findById(item.book);
      if (!book) {
        return next(new Error(`Book not found with id: ${item.book}`));
      }
      if (book.stock < item.quantity) {
        return next(new Error(`Insufficient stock for book: ${book.title}`));
      }
      book.stock -= item.quantity;
      await book.save();
    }
  }
  next();
});

// Order yaratilgandan keying hook
orderSchema.post('save', async function(doc) {
  try {
    // User purchase history ga qo'shish
    const User = mongoose.model('User');
    const user = await User.findById(doc.user);
    
    doc.items.forEach(item => {
      user.purchaseHistory.push({
        book: item.book,
        purchaseDate: doc.createdAt,
        price: item.price
      });
    });
    
    await user.save();
  } catch (error) {
    console.error('Order post-save hook error:', error);
  }
});

// Order bekor qilinganda
orderSchema.methods.cancelOrder = async function(reason) {
  if (this.orderStatus === 'delivered') {
    throw new Error('Cannot cancel delivered order');
  }
  
  this.orderStatus = 'cancelled';
  
  // Agar to'lov qilingan bo'lsa, refund status
  if (this.paymentStatus === 'completed') {
    this.paymentStatus = 'refunded';
  }
  
  // Stockni qaytarish
  const Book = mongoose.model('Book');
  for (const item of this.items) {
    await Book.findByIdAndUpdate(item.book, {
      $inc: { stock: item.quantity }
    });
  }
  
  return this.save();
};

// Orderning umumiy narxini hisoblash
orderSchema.methods.calculateTotalAmount = function() {
  return this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

module.exports = mongoose.model('Order', orderSchema); 