// src/routes/verifyEmail.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

/**
 * @route GET /verify-email
 * @desc Email tasdiqlash endpointi
 * @query {string} token - JWT token
 */
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;
    console.log(token,"token");
  if (!token) {
    return res.status(400).send('Token is missing');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).send('User not found');
    }
    // Email tasdiqlash
    user.isVerified = true;
    await user.save();
    res.send('Your email has been successfully verified. You can now log in.');
  } catch (error) {
    console.error(error);
    res.status(400).send('Invalid or expired token');
  }
});

module.exports = router;
