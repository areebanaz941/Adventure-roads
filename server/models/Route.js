const routeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  surfaceType: String,
  coordinates: {
    type: {
      type: String,
      enum: ['LineString'],
      required: true
    },
    coordinates: [[Number]]
  },
  gpxFile: String,
  distance: Number,
  metadata: {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    lastModified: Date
  }
}, {
  timestamps: true
});

module.exports = model('Route', routeSchema);
