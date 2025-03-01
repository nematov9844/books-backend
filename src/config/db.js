// src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // MongoDB Atlas uchun kerakli parametrlar:
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB ga muvaffaqiyatli ulandi');
  } catch (error) {
    console.error('MongoDB ulanishida xatolik:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
