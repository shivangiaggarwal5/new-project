const express = require('express');
const cloudinary = require('../config/cloudinary');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Media = require('../models/Media');

const router = express.Router();
router.use(auth);

// Upload a buffer to Cloudinary (memoryStorage -> upload_stream)
function uploadBuffer(buffer, mimetype) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'socialboost', resource_type: 'auto' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

// POST /api/media/upload — single file field "media"
router.post('/upload', upload.single('media'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded (field "media")' });
    const result = await uploadBuffer(req.file.buffer, req.file.mimetype);
    const mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
    const media = await Media.create({
      userId: req.userId,
      fileUrl: result.secure_url,
      mediaType,
      originalName: req.file.originalname,
      cloudinaryId: result.public_id,
    });
    res.status(201).json({ media });
  } catch (err) {
    next(err);
  }
});

// GET /api/media — current user's uploads
router.get('/', async (req, res, next) => {
  try {
    const items = await Media.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ media: items });
  } catch (err) {
    next(err);
  }
});

// GET /api/media/:id
router.get('/:id', async (req, res, next) => {
  try {
    const item = await Media.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ message: 'Media not found' });
    res.json({ media: item });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/media/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const item = await Media.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ message: 'Media not found' });
    try {
      await cloudinary.uploader.destroy(item.cloudinaryId, {
        resource_type: item.mediaType === 'video' ? 'video' : 'image',
      });
    } catch (e) { /* non-fatal: still remove DB doc */ }
    await item.deleteOne();
    res.json({ message: 'Media deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
