// models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  routeName: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This will auto-manage createdAt and updatedAt
});

// Add a pre-save middleware to sanitize data
commentSchema.pre('save', async function(next) {
  // You could add any pre-save processing here
  // For example, sanitizing content, validating routeName, etc.
  next();
});

// Add instance methods if needed
commentSchema.methods.approve = async function() {
  this.status = 'approved';
  return await this.save();
};

commentSchema.methods.reject = async function() {
  this.status = 'rejected';
  return await this.save();
};

module.exports = mongoose.model('Comment', commentSchema);