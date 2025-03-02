// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const passport = require('passport');
const { swaggerUi, specs } = require('./config/swagger');
const securityMiddleware = require('./middlewares/securityMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');
const { handleMulterError } = require('./config/multer');
const AppError = require('./utils/appError');

// Model imports
require('./config/passport');
require('./models/Author');
require('./models/Book');
require('./models/Category');
require('./models/Order');

const app = express();

// Security middleware'larni qo'shish
securityMiddleware(app);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Basic middleware'lar
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  // origin: process.env.CLIENT_URL,
  origin: '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(passport.initialize());

// Static fayllar uchun
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ma'lumotlar bazasiga ulanish
connectDB();

// Routerlarni import qilish
const authRoutes = require('./routes/authRoutes');
const verifyEmailRoutes = require('./routes/verifyEmail');
const bookRoutes = require('./routes/bookRoutes');
const authorRoutes = require('./routes/authorRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Routerlarni ulash
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', verifyEmailRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/authors', authorRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reviews', reviewRoutes);

// 404 handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware'lar
app.use(handleMulterError);
app.use(errorMiddleware);

// Server ishga tushirish
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portda ishga tushdi...`);
});
