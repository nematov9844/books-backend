const Order = require('../models/Order');
const Book = require('../models/Book');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all orders
exports.getAllOrders = catchAsync(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .populate('items.book', 'title price');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders }
  });
});

// Get user orders
exports.getUserOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('items.book', 'title coverImage price');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders }
  });
});

// Get single order
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.book', 'title coverImage price');

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  // Check if the order belongs to the user or user is admin
  if (order.user.id !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to view this order', 403));
  }

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

// Create new order
exports.createOrder = catchAsync(async (req, res, next) => {
  // Add user to request body
  req.body.user = req.user.id;

  // Calculate total amount
  let totalAmount = 0;
  for (const item of req.body.items) {
    const book = await Book.findById(item.book);
    if (!book) {
      return next(new AppError(`Book not found with ID: ${item.book}`, 404));
    }
    if (book.stock < item.quantity) {
      return next(new AppError(`Insufficient stock for book: ${book.title}`, 400));
    }
    item.price = book.discountPrice || book.price;
    totalAmount += item.price * item.quantity;
  }
  req.body.totalAmount = totalAmount;

  const order = await Order.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { order }
  });
});

// Update order status
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { orderStatus } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  // Only admin can update order status
  if (req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to perform this action', 403));
  }

  order.orderStatus = orderStatus;
  await order.save();

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

// Cancel order
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  // Check if the order belongs to the user or user is admin
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to cancel this order', 403));
  }

  // Check if order can be cancelled
  if (order.orderStatus !== 'pending' && order.orderStatus !== 'processing') {
    return next(new AppError('This order cannot be cancelled', 400));
  }

  // Update order status
  order.orderStatus = 'cancelled';
  await order.save();

  // Restore book stock
  for (const item of order.items) {
    await Book.findByIdAndUpdate(item.book, {
      $inc: { stock: item.quantity }
    });
  }

  res.status(200).json({
    status: 'success',
    data: { order }
  });
}); 