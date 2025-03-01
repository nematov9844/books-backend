const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middlewares/authMiddleware');

// Umumiy endpointlar
router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBook);

// Admin uchun endpointlar (authMiddleware orqali ruxsatni tekshirish mumkin)
router.post('/', authMiddleware, bookController.createBook);
router.put('/:id', authMiddleware, bookController.updateBook);
router.delete('/:id', authMiddleware, bookController.deleteBook);

module.exports = router;
