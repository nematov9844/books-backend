const User = require('../models/User');

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.params.userId, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

// Wishlist uchun amallar
exports.addToWishlist = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { bookId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (!user.wishlist.includes(bookId)) {
      user.wishlist.push(bookId);
      await user.save();
    }
    res.status(200).json({ message: 'Book added to wishlist' });
  } catch (error) {
    next(error);
  }
};

exports.getWishlist = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('wishlist');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};

// Cart uchun amallar
exports.addToCart = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { bookId, quantity } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const cartItemIndex = user.cart.findIndex(item => item.book.toString() === bookId);
    if (cartItemIndex > -1) {
      user.cart[cartItemIndex].quantity += quantity || 1;
    } else {
      user.cart.push({ book: bookId, quantity: quantity || 1 });
    }
    await user.save();
    res.status(200).json({ message: 'Book added to cart' });
  } catch (error) {
    next(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('cart.book');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ cart: user.cart });
  } catch (error) {
    next(error);
  }
};
