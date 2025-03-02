const Review = require('../models/Review');
const Book = require('../models/Book');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all reviews
exports.getAllReviews = catchAsync(async (req, res) => {
  let filter = {};
  if (req.params.bookId) filter = { book: req.params.bookId };

  const reviews = await Review.find(filter)
    .populate('user', 'name photo')
    .populate('book', 'title');

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews }
  });
});

// Get single review
exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate('user', 'name photo')
    .populate('book', 'title coverImage');

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { review }
  });
});

// Create new review
exports.createReview = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.book) req.body.book = req.params.bookId;
  if (!req.body.user) req.body.user = req.user.id;

  // Check if book exists
  const book = await Book.findById(req.body.book);
  if (!book) {
    return next(new AppError('No book found with that ID', 404));
  }

  // Check if user has already reviewed this book
  const existingReview = await Review.findOne({
    user: req.user.id,
    book: req.body.book
  });

  if (existingReview) {
    return next(new AppError('You have already reviewed this book', 400));
  }

  // Create review
  const review = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { review }
  });
});

// Update review
exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  // Check if review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to update this review', 403));
  }

  // Mark review as edited
  req.body.isEdited = true;

  const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: { review: updatedReview }
  });
});

// Delete review
exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  // Check if review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to delete this review', 403));
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Like review
exports.likeReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  // Check if user has already liked this review
  const hasLiked = review.likes.includes(req.user.id);

  if (hasLiked) {
    // Unlike
    review.likes = review.likes.filter(
      userId => userId.toString() !== req.user.id
    );
  } else {
    // Like
    review.likes.push(req.user.id);
  }

  await review.save();

  res.status(200).json({
    status: 'success',
    data: { review }
  });
}); 