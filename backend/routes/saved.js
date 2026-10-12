const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const SavedContent = require('../models/SavedContent');
const Content = require('../models/Content');

const router = express.Router();
router.use(auth);

// POST /api/saved — { contentId }
router.post(
  '/',
  [body('contentId').notEmpty().withMessage('contentId is required')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { contentId } = req.body;
      const content = await Content.findById(contentId);
      if (!content) return res.status(404).json({ message: 'Content not found' });
      const existing = await SavedContent.findOne({ userId: req.userId, contentId });
      if (existing) return res.status(400).json({ message: 'Already saved' });
      const saved = await SavedContent.create({ userId: req.userId, contentId });
      res.status(201).json({ saved });
    } catch (err) {
      // Duplicate key (race) -> friendly message
      if (err.code === 11000) return res.status(400).json({ message: 'Already saved' });
      next(err);
    }
  }
);

// GET /api/saved
router.get('/', async (req, res, next) => {
  try {
    const items = await SavedContent.find({ userId: req.userId }).populate('contentId').sort({ createdAt: -1 });
    res.json({ saved: items });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/saved/:id — :id is the savedId
router.delete('/:id', async (req, res, next) => {
  try {
    const item = await SavedContent.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ message: 'Saved item not found' });
    await item.deleteOne();
    res.json({ message: 'Removed from saved' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
