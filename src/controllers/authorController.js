const Author = require('../models/Author');
const Book = require('../models/Book');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// Get all authors
exports.getAllAuthors = catchAsync(async (req, res) => {
  const features = new APIFeatures(Author.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const authors = await features.query.populate('books', 'title');

  res.status(200).json({
    status: 'success',
    results: authors.length,
    data: { authors }
  });
});

// Get single author
exports.getAuthor = catchAsync(async (req, res, next) => {
  const author = await Author.findById(req.params.id).populate('books');

  if (!author) {
    return next(new AppError('No author found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { author }
  });
});

// Create new author
exports.createAuthor = catchAsync(async (req, res) => {
  const author = await Author.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { author }
  });
});

// Update author
exports.updateAuthor = catchAsync(async (req, res, next) => {
  const author = await Author.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!author) {
    return next(new AppError('No author found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { author }
  });
});

// Delete author
exports.deleteAuthor = catchAsync(async (req, res, next) => {
  const author = await Author.findById(req.params.id);

  if (!author) {
    return next(new AppError('No author found with that ID', 404));
  }

  // Check if author has books
  const hasBooks = await Book.exists({ author: req.params.id });
  if (hasBooks) {
    return next(new AppError('Cannot delete author with existing books. Delete or reassign books first.', 400));
  }

  await Author.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Search authors
exports.searchAuthors = catchAsync(async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return next(new AppError('Please provide a search query', 400));
  }

  const authors = await Author.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { biography: { $regex: query, $options: 'i' } }
    ]
  });

  res.status(200).json({
    status: 'success',
    results: authors.length,
    data: { authors }
  });
});

// Get author statistics
exports.getAuthorStats = catchAsync(async (req, res) => {
  const author = await Author.findById(req.params.id);

  if (!author) {
    return next(new AppError('No author found with that ID', 404));
  }

  const stats = await Book.aggregate([
    {
      $match: { author: author._id }
    },
    {
      $group: {
        _id: null,
        totalBooks: { $sum: 1 },
        avgRating: { $avg: '$ratings.average' },
        totalRatings: { $sum: '$ratings.count' },
        avgPrice: { $avg: '$price' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        totalBooks: 0,
        avgRating: 0,
        totalRatings: 0,
        avgPrice: 0
      }
    }
  });
}); 