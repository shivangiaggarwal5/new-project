const express = require('express');
const auth = require('../middleware/auth');
const ContentHistory = require('../models/ContentHistory');

const router = express.Router();
router.use(auth);

// GET /api/history — all history for the current user
router.get('/', async (req, res, next) => {
  try {
    const history = await ContentHistory.find({ userId: req.userId })
      .populate('contentId')
      .sort({ createdAt: -1 });
    res.json({ history });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
