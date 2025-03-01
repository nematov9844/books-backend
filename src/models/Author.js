const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String },
  imageUrl: { type: String },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
}, { timestamps: true });

module.exports = mongoose.model('Author', AuthorSchema);
