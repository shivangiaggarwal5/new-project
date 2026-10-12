const mongoose = require('mongoose');

const mediaAnalysisSchema = new mongoose.Schema(
  {
    mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true, index: true },
    objects: { type: [String], default: [] },
    scene: { type: String, default: '' },
    mood: { type: String, default: '' },
    category: { type: String, default: '' },
    keywords: { type: [String], default: [] },
    detectedText: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MediaAnalysis', mediaAnalysisSchema);
