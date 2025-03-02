const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/search/books:
 *   get:
 *     summary: Search and filter books
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for title, description or tags
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category ID to filter by
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Language to filter by
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *         description: Minimum rating
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, rating, newest, popular]
 *         description: Sort option
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per page
 */
router.get('/books', searchController.searchBooks);

/**
 * @swagger
 * /api/search/categories:
 *   get:
 *     summary: Get all active categories
 *     tags: [Search]
 */
router.get('/categories', searchController.getCategories);

/**
 * @swagger
 * /api/search/languages:
 *   get:
 *     summary: Get all available languages
 *     tags: [Search]
 */
router.get('/languages', searchController.getLanguages);

/**
 * @swagger
 * /api/search/price-range:
 *   get:
 *     summary: Get min and max price range
 *     tags: [Search]
 */
router.get('/price-range', searchController.getPriceRange);

/**
 * @swagger
 * /api/search/recommended:
 *   get:
 *     summary: Get recommended books for user
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 */
router.get('/recommended', authMiddleware, searchController.getRecommendedBooks);

/**
 * @swagger
 * /api/search/popular:
 *   get:
 *     summary: Get popular books
 *     tags: [Search]
 */
router.get('/popular', searchController.getPopularBooks);

module.exports = router; 