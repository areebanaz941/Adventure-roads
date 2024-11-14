// server/models/Route.js

const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Feature']
  },
  properties: {
    name: {
      type: String,
      required: [true, 'Route name is required'],
      trim: true
    },
    description: {
      type: String,
      default: 'No description'
    },
    fileName: String,
    roadType: {
      type: String,
      enum: ['Tar/Sealed Road', 'Gravel Road', 'Dirt Track', 'Off Road', 'Mixed Surface'],
      default: 'Tar/Sealed Road'
    },
    difficulty: {
      type: String,
      enum: ['Unknown', 'Easy', 'Moderate', 'Difficult', 'Very Difficult', 'Extreme'],
      default: 'Unknown'
    },
    time: {
      type: Date,
      default: Date.now
    },
    stats: {
      totalDistance: {
        type: Number,
        required: true
      },
      maxElevation: {
        type: Number,
        required: true
      },
      minElevation: {
        type: Number,
        required: true
      },
      elevationGain: {
        type: Number,
        required: true
      },
      numberOfPoints: {
        type: Number,
        required: true
      }
    }
  },
  geometry: {
    type: {
      type: String,
      enum: ['LineString'],
      required: true
    },
    coordinates: {
      type: [[Number]],
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length >= 2 && 
                 coords.every(coord => 
                   coord.length >= 2 && 
                   coord.length <= 3 &&
                   coord[0] >= -180 && 
                   coord[0] <= 180 && 
                   coord[1] >= -90 && 
                   coord[1] <= 90
                 );
        },
        message: 'Invalid coordinates'
      }
    }
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
RouteSchema.index({ 'geometry.coordinates': '2dsphere' });
RouteSchema.index({ 'properties.name': 'text', 'properties.description': 'text' });

module.exports = mongoose.model('Route', RouteSchema);