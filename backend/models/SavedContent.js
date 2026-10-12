const mongoose = require('mongoose');

const savedContentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

savedContentSchema.index({ userId: 1, contentId: 1 }, { unique: true });

module.exports = mongoose.model('SavedContent', savedContentSchema);
