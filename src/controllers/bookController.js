const Book = require('../models/Book');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// Get all books
exports.getAllBooks = catchAsync(async (req, res) => {
  const features = new APIFeatures(Book.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const books = await features.query.populate([
    { path: 'author', select: 'name' },
    { path: 'categories', select: 'name' }
  ]);

  res.status(200).json({
    status: 'success',
    results: books.length,
    data: { books }
  });
});

// Get single book
exports.getBook = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.id)
    .populate('author')
    .populate('categories')
    .populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'name photo'
      }
    });

  if (!book) {
    return next(new AppError('No book found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { book }
  });
});

// Create new book
exports.createBook = catchAsync(async (req, res) => {
  const book = await Book.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { book }
  });
});

// Update book
exports.updateBook = catchAsync(async (req, res, next) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!book) {
    return next(new AppError('No book found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { book }
  });
});

// Delete book
exports.deleteBook = catchAsync(async (req, res, next) => {
  const book = await Book.findByIdAndDelete(req.params.id);

  if (!book) {
    return next(new AppError('No book found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Search books
exports.searchBooks = catchAsync(async (req, res) => {
  const { query } = req.query;
  
  const books = await Book.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .populate('author', 'name')
    .populate('categories', 'name');

  res.status(200).json({
    status: 'success',
    results: books.length,
    data: { books }
  });
});

// Get books by category
exports.getBooksByCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;

  const books = await Book.find({ categories: categoryId })
    .populate('author', 'name')
    .populate('categories', 'name');

  res.status(200).json({
    status: 'success',
    results: books.length,
    data: { books }
  });
});

// Get books by author
exports.getBooksByAuthor = catchAsync(async (req, res) => {
  const { authorId } = req.params;

  const books = await Book.find({ author: authorId })
    .populate('categories', 'name');

  res.status(200).json({
    status: 'success',
    results: books.length,
    data: { books }
  });
});
