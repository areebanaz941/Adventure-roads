// models/Route.js
const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  name: String,
  description: String,
  fileName: String,
  roadType: String,
  path: {
    type: [[Number]], // Assuming coordinates are stored as array of coordinate pairs
    index: true // Create an index for faster querying
  },
  stats: {
    totalDistance: Number,
    maxElevation: Number,
    minElevation: Number,
    elevationGain: Number,
    numberOfPoints: Number
  },
  createdAt: { type: Date, default: Date.now }
});

// Add a unique index on path to prevent exact duplicates
RouteSchema.index({ path: 1 }, { unique: true });

module.exports = mongoose.model('Route', RouteSchema);