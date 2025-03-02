const { body, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

// Validation result handler
const handleValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    return next(new AppError(errorMessages.join('. '), 400));
  }
  next();
};

// Book creation validation
exports.validateBookCreation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Book title is required')
    .isLength({ max: 100 }).withMessage('Title cannot be more than 100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Book description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price')
    .notEmpty().withMessage('Book price is required')
    .isFloat({ min: 0 }).withMessage('Price cannot be negative'),
  body('author')
    .notEmpty().withMessage('Book author is required')
    .isMongoId().withMessage('Invalid author ID'),
  body('categories')
    .isArray().withMessage('Categories must be an array')
    .notEmpty().withMessage('At least one category is required')
    .custom(categories => categories.every(cat => typeof cat === 'string')).withMessage('Invalid category ID'),
  body('format')
    .notEmpty().withMessage('Book format is required')
    .isIn(['hardcover', 'paperback', 'ebook', 'audiobook']).withMessage('Invalid book format'),
  body('isbn')
    .notEmpty().withMessage('ISBN is required')
    .matches(/^[\d-]{10,17}$/).withMessage('Invalid ISBN format'),
  body('language')
    .notEmpty().withMessage('Book language is required'),
  body('pages')
    .notEmpty().withMessage('Number of pages is required')
    .isInt({ min: 1 }).withMessage('Pages must be at least 1'),
  body('publisher')
    .notEmpty().withMessage('Publisher is required'),
  body('publicationDate')
    .notEmpty().withMessage('Publication date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('stock')
    .notEmpty().withMessage('Stock quantity is required')
    .isInt({ min: 0 }).withMessage('Stock cannot be negative'),
  handleValidationResult
];

// Book update validation
exports.validateBookUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot be more than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price cannot be negative'),
  body('author')
    .optional()
    .isMongoId().withMessage('Invalid author ID'),
  body('categories')
    .optional()
    .isArray().withMessage('Categories must be an array')
    .custom(categories => categories.every(cat => typeof cat === 'string')).withMessage('Invalid category ID'),
  body('format')
    .optional()
    .isIn(['hardcover', 'paperback', 'ebook', 'audiobook']).withMessage('Invalid book format'),
  body('isbn')
    .optional()
    .matches(/^[\d-]{10,17}$/).withMessage('Invalid ISBN format'),
  body('pages')
    .optional()
    .isInt({ min: 1 }).withMessage('Pages must be at least 1'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock cannot be negative'),
  handleValidationResult
];

// Category validation
exports.validateCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ max: 50 }).withMessage('Category name cannot be more than 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot be more than 500 characters'),
  body('parent')
    .optional()
    .isMongoId().withMessage('Invalid parent category ID'),
  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  handleValidationResult
];

// Review validation
exports.validateReview = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot be more than 100 characters'),
  body('comment')
    .trim()
    .notEmpty().withMessage('Review comment is required')
    .isLength({ min: 10, max: 500 }).withMessage('Comment must be between 10 and 500 characters'),
  body('images')
    .optional()
    .isArray().withMessage('Images must be an array')
    .custom(images => images.every(img => /\.(jpg|jpeg|png|gif)$/i.test(img))).withMessage('Invalid image format'),
  handleValidationResult
];

// Order validation
exports.validateOrder = [
  body('items')
    .isArray().withMessage('Items must be an array')
    .notEmpty().withMessage('Order must have at least one item')
    .custom(items => items.every(item => 
      typeof item === 'object' && 
      item.book && 
      typeof item.quantity === 'number' && 
      item.quantity > 0
    )).withMessage('Invalid order items'),
  body('shippingAddress')
    .isObject().withMessage('Shipping address is required')
    .custom(address => {
      const requiredFields = ['street', 'city', 'state', 'country', 'zipCode'];
      return requiredFields.every(field => address[field] && typeof address[field] === 'string');
    }).withMessage('Invalid shipping address'),
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['credit_card', 'debit_card', 'paypal']).withMessage('Invalid payment method'),
  handleValidationResult
];

// Email validation
exports.validateEmail = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  handleValidationResult
];

// Password validation
exports.validatePassword = [
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('passwordConfirm')
    .trim()
    .notEmpty().withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  handleValidationResult
];

