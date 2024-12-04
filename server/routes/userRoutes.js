// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
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

module.exports = router;