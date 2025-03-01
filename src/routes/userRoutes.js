const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Foydalanuvchi profili
router.get('/:userId', authMiddleware, userController.getUserProfile);
router.put('/:userId', authMiddleware, userController.updateUserProfile);

// Wishlist
router.get('/:userId/wishlist', authMiddleware, userController.getWishlist);
router.post('/:userId/wishlist', authMiddleware, userController.addToWishlist);

// Cart
router.get('/:userId/cart', authMiddleware, userController.getCart);
router.post('/:userId/cart', authMiddleware, userController.addToCart);

module.exports = router;
