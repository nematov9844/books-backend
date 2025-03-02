const SearchService = require('../services/searchService');
const catchAsync = require('../utils/catchAsync');
const { cache } = require('../config/redis');

// Kitoblarni qidirish
exports.searchBooks = catchAsync(async (req, res) => {
  const result = await SearchService.searchBooks(req.query);
  
  res.status(200).json({
    status: 'success',
    data: result
  });
});

// Kategoriyalarni olish
exports.getCategories = catchAsync(async (req, res) => {
  // Cache dan foydalanish
  const categories = await cache(300)(req, res, async () => {
    return await SearchService.getCategories();
  });
  
  res.status(200).json({
    status: 'success',
    data: categories
  });
});

// Tillarni olish
exports.getLanguages = catchAsync(async (req, res) => {
  // Cache dan foydalanish
  const languages = await cache(300)(req, res, async () => {
    return await SearchService.getLanguages();
  });
  
  res.status(200).json({
    status: 'success',
    data: languages
  });
});

// Narx oralig'ini olish
exports.getPriceRange = catchAsync(async (req, res) => {
  // Cache dan foydalanish
  const priceRange = await cache(300)(req, res, async () => {
    return await SearchService.getPriceRange();
  });
  
  res.status(200).json({
    status: 'success',
    data: priceRange
  });
});

// Tavsiya etilgan kitoblar
exports.getRecommendedBooks = catchAsync(async (req, res) => {
  const { limit } = req.query;
  const books = await SearchService.getRecommendedBooks(req.user._id, limit);
  
  res.status(200).json({
    status: 'success',
    data: books
  });
});

// Mashhur kitoblar
exports.getPopularBooks = catchAsync(async (req, res) => {
  const { limit } = req.query;
  
  // Cache dan foydalanish
  const books = await cache(300)(req, res, async () => {
    return await SearchService.getPopularBooks(limit);
  });
  
  res.status(200).json({
    status: 'success',
    data: books
  });
}); 