const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// Get all categories
exports.getAllCategories = catchAsync(async (req, res) => {
  const features = new APIFeatures(Category.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const categories = await features.query.populate('subcategories');

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: { categories }
  });
});

// Get category tree
exports.getCategoryTree = catchAsync(async (req, res) => {
  const categories = await Category.find({ parent: null })
    .populate({
      path: 'subcategories',
      populate: { path: 'subcategories' }
    });

  res.status(200).json({
    status: 'success',
    data: { categories }
  });
});

// Get single category
exports.getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id)
    .populate('subcategories')
    .populate('booksCount');

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { category }
  });
});

// Create new category
exports.createCategory = catchAsync(async (req, res) => {
  const category = await Category.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { category }
  });
});

// Update category
exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { category }
  });
});

// Delete category
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  // Check if category has subcategories
  const hasSubcategories = await Category.exists({ parent: category._id });
  if (hasSubcategories) {
    return next(new AppError('Cannot delete category with subcategories', 400));
  }

  // Check if category has books
  const booksCount = await category.booksCount;
  if (booksCount > 0) {
    return next(new AppError('Cannot delete category with books', 400));
  }

  await category.remove();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get subcategories
exports.getSubcategories = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  const subcategories = await Category.find({ parent: category._id });

  res.status(200).json({
    status: 'success',
    results: subcategories.length,
    data: { subcategories }
  });
}); 