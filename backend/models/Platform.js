const mongoose = require('mongoose');

const platformSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, lowercase: true, trim: true },
    types: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Platform', platformSchema);
