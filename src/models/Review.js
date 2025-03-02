const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Review must belong to a book']
  },
  rating: {
    type: Number,
    required: [true, 'Review must have a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review must have a comment'],
    trim: true,
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return v.match(/\.(jpg|jpeg|png|gif)$/i);
      },
      message: props => `${props.value} is not a valid image format!`
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Bir foydalanuvchi bir kitobga faqat bitta review yozishi mumkin
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

// Review yaratilganda yoki o'zgartirilganda book rating yangilanadi
reviewSchema.statics.calcAverageRating = async function(bookId) {
  const stats = await this.aggregate([
    {
      $match: { book: bookId, isActive: true }
    },
    {
      $group: {
        _id: '$book',
        avgRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Book').findByIdAndUpdate(bookId, {
      'ratings.average': stats[0].avgRating,
      'ratings.count': stats[0].ratingCount
    });
  } else {
    await mongoose.model('Book').findByIdAndUpdate(bookId, {
      'ratings.average': 0,
      'ratings.count': 0
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.book);
});

reviewSchema.post('remove', function() {
  this.constructor.calcAverageRating(this.book);
});

module.exports = mongoose.model('Review', reviewSchema); 