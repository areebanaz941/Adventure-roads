// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Register: POST /api/user
router.post('/', async (req, res) => {
  try {
    const existingUser = await User.findOne({ 
      $or: [{ email: req.body.email }, { username: req.body.username }]
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email or username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      email: req.body.email,
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      location: req.body.location,
      vehicleInfo: req.body.vehicleInfo,
      password: hashedPassword
    });

    const savedUser = await newUser.save();
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({ success: true, data: userResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login: POST /api/user/login
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({
      $or: [
        { email: req.body.emailOrUsername },
        { username: req.body.emailOrUsername }
      ]
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ success: true, data: userResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.post('/reset-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    
    // For security, don't reveal if email exists or not
    if (!user) {
      return res.json({ 
        success: true, 
        message: 'If this email exists in our system, you will receive password reset instructions.' 
      });
    }

    // Generate unique reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Save reset token in PasswordReset collection
    const passwordReset = new PasswordReset({
      userId: user._id,
      token: resetToken
    });
    await passwordReset.save();

    // For development/testing, log the reset token
    console.log(`Password reset token for ${user.email}: ${resetToken}`);
    console.log(`Reset URL: http://localhost:3000/reset-password/${resetToken}`);

    res.json({
      success: true,
      message: 'Password reset instructions have been sent. Please check your registered email.',
      // In development, you might want to return the token for testing
      ...(process.env.NODE_ENV === 'development' && { token: resetToken })
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while processing your request' 
    });
  }
});

// Handle the actual password reset
router.post('/reset-password/:token', async (req, res) => {
  try {
    // Find valid reset token
    const passwordReset = await PasswordReset.findOne({
      token: req.params.token,
      createdAt: { $gt: new Date(Date.now() - 3600000) } // Within last hour
    });

    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Find user and update password
    const user = await User.findById(passwordReset.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.newPassword, salt);
    await user.save();

    // Delete the used reset token
    await PasswordReset.deleteOne({ _id: passwordReset._id });

    res.json({
      success: true,
      message: 'Your password has been successfully reset'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting your password'
    });
  }
});

module.exports = router;