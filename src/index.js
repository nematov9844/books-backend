// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const passport = require('passport');
const { swaggerUi, specs } = require('./config/swagger');
require('./config/passport');
require('./models/Author');
require('./models/Book');

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware'lar
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));
app.use(passport.initialize());

// Ma'lumotlar bazasiga ulanish
connectDB();

// Routersni import qilish
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const verifyEmailRoutes = require('./routes/verifyEmail'); // Yangi qo'shilgan

// Routersni ulash
app.use('/api/auth', authRoutes);
app.use('/api/users', require('./middlewares/authMiddleware'), userRoutes);
app.use('/api/books', require('./middlewares/authMiddleware'), bookRoutes);
app.use('/', verifyEmailRoutes); // Shu yerda verify-email endpointi montaj qilindi

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portda ishga tushdi...`);
});
