const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['image', 'video'], required: true },
    originalName: { type: String, default: '' },
    cloudinaryId: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Media', mediaSchema);
