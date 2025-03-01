const Book = require('../models/Book');

exports.createBook = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ book });
  } catch (error) {
    next(error);
  }
};
// src/controllers/bookController.js
exports.getBooks = async (req, res, next) => {
    try {
      // Query parametrlarini oling
      const { title, category } = req.query;
      let filter = {};
  
      if (title) {
        // regex orqali title bo'yicha qidiruv
        filter.title = { $regex: title, $options: 'i' };
      }
      if (category) {
        filter.categories = { $in: [category] };
      }
      
      // Filter qilingan kitoblarni olish
      const books = await Book.find(filter).populate('author');
      res.status(200).json({ books });
    } catch (error) {
      next(error);
    }
  };
  
exports.getBooks = async (req, res, next) => {
  try {
    // Filterlash, qidiruv va paginatsiyani qo'shishingiz mumkin
    const books = await Book.find().populate('author');
    res.status(200).json({ books });
  } catch (error) {
    next(error);
  }
};

exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('author');
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json({ book });
  } catch (error) {
    next(error);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json({ book });
  } catch (error) {
    next(error);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    next(error);
  }
};
