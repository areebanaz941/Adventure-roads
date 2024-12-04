// models/Route.js
const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: String,
  description: String,
  fileName: String,
  roadType: String,
  path: [[Number]],
  stats: {
    totalDistance: Number,
    maxElevation: Number,
    minElevation: Number,
    elevationGain: Number,
    numberOfPoints: Number
  }
}, { collection: 'routes' });

module.exports = mongoose.model('Route', routeSchema);