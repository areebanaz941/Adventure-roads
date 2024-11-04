const commentSchema = new Schema({
    content: {
      type: String,
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    route: {
      type: Schema.Types.ObjectId,
      ref: 'Route',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }, {
    timestamps: true
  });
  
  module.exports = model('Comment', commentSchema);