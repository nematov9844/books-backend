const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Book description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters']
  },
  price: {
    type: Number,
    required: [true, 'Book price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    validate: {
      validator: function(value) {
        return !value || value <= this.price;
      },
      message: 'Discount price cannot be greater than regular price'
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: [true, 'Book author is required']
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'At least one category is required']
  }],
  coverImage: {
    type: String,
    required: [true, 'Book cover image is required']
  },
  format: {
    type: String,
    enum: ['hardcover', 'paperback', 'ebook', 'audiobook'],
    required: [true, 'Book format is required']
  },
  language: {
    type: String,
    required: [true, 'Book language is required']
  },
  pages: {
    type: Number,
    required: [true, 'Number of pages is required'],
    min: [1, 'Pages must be at least 1']
  },
  isbn: {
    type: String,
    unique: true,
    required: [true, 'ISBN is required']
  },
  publisher: {
    type: String,
    required: [true, 'Publisher is required']
  },
  publicationDate: {
    type: Date,
    required: [true, 'Publication date is required']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative']
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot be above 5'],
      set: val => Math.round(val * 10) / 10
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indekslar
bookSchema.index({ title: 'text', description: 'text' });
bookSchema.index({ price: 1, discountPrice: 1 });
bookSchema.index({ categories: 1 });
bookSchema.index({ author: 1 });

// Virtual field for discount percentage
bookSchema.virtual('discountPercentage').get(function() {
  if (!this.discountPrice) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

module.exports = mongoose.model('Book', bookSchema);
