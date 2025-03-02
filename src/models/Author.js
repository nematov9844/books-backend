const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxLength: [100, 'Name cannot be more than 100 characters']
  },
  biography: {
    type: String,
    required: [true, 'Author biography is required'],
    trim: true,
    minLength: [100, 'Biography must be at least 100 characters'],
    maxLength: [2000, 'Biography cannot be more than 2000 characters']
  },
  photo: {
    type: String,
    default: 'default-author.jpg'
  },
  birthDate: {
    type: Date,
    required: [true, 'Birth date is required']
  },
  deathDate: {
    type: Date
  },
  nationality: {
    type: String,
    required: [true, 'Nationality is required'],
    trim: true
  },
  website: {
    type: String,
    trim: true,
    match: [
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
      'Please provide a valid URL'
    ]
  },
  socialMedia: {
    twitter: String,
    facebook: String,
    instagram: String
  },
  awards: [{
    name: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    description: String
  }],
  isActive: {
    type: Boolean,
    default: true,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate
authorSchema.virtual('books', {
  ref: 'Book',
  foreignField: 'author',
  localField: '_id'
});

// Indexes
authorSchema.index({ name: 1 });
authorSchema.index({ nationality: 1 });

// Only find active authors
authorSchema.pre(/^find/, function(next) {
  this.find({ isActive: { $ne: false } });
  next();
});

// Calculate age
authorSchema.virtual('age').get(function() {
  if (!this.birthDate) return null;
  const endDate = this.deathDate || new Date();
  const age = Math.floor((endDate - this.birthDate) / (1000 * 60 * 60 * 24 * 365.25));
  return age;
});

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;
