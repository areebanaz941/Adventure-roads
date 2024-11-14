const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  properties: {
    name: String,
    description: String,
    fileName: String,
    url: String,
    roadType: String,
    difficulty: String,
    time: Date,
    stats: {
      totalDistance: Number,
      maxElevation: Number,
      minElevation: Number,
      elevationGain: Number,
      numberOfPoints: Number
    }
  },
  geometry: {
    type: { type: String, required: true },
    coordinates: [[Number]] // Array of [longitude, latitude, elevation]
  },
  waypoints: [{
    latitude: Number,
    longitude: Number,
    elevation: Number
  }]
});

const Route = mongoose.model('Route', routeSchema);

module.exports = Route;