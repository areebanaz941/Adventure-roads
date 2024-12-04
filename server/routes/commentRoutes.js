// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// Add comment
router.post('/', async (req, res) => {
  try {
    const newComment = new Comment({
      routeName: req.body.routeName,
      username: req.body.username,
      content: req.body.content
    });
    
    const savedComment = await newComment.save();
    res.status(201).json({ success: true, data: savedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get comments for a route
router.get('/:routeName', async (req, res) => {
  try {
    const comments = await Comment.find({ routeName: req.params.routeName })
      .sort('-timestamp');
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// In your commentRoutes.js

// Get all comments (admin route)
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find().sort('-timestamp');
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete comment (admin route)
router.delete('/:id', async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;