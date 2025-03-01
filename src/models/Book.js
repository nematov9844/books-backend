const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  categories: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
  pdfUrl: { type: String },
  images: [{ type: String }],
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: { type: String },
    rating: { type: Number }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);
