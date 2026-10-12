const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Media = require('../models/Media');
const MediaAnalysis = require('../models/MediaAnalysis');
const Content = require('../models/Content');
const ContentHistory = require('../models/ContentHistory');
const { analyzeAndGenerate } = require('../services/aiService');

const router = express.Router();
router.use(auth);

const PLATFORMS = ['instagram', 'youtube', 'facebook'];

const generateValidators = [
  body('mediaId').notEmpty().withMessage('mediaId is required'),
  body('platform').isIn(PLATFORMS).withMessage('platform must be instagram|youtube|facebook'),
  body('contentType').trim().notEmpty().withMessage('contentType is required'),
];

function check(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
}

async function logHistory(userId, contentId, action) {
  return ContentHistory.create({ userId, contentId, action });
}

// POST /api/content/generate — analyse media + generate content via Gemini
router.post('/generate', generateValidators, async (req, res, next) => {
  try {
    if (!check(req, res)) return;
    const { mediaId, platform, contentType, audience, tone, goal } = req.body;
    const media = await Media.findOne({ _id: mediaId, userId: req.userId });
    if (!media) return res.status(404).json({ message: 'Media not found' });

    const mimeType = media.mediaType === 'video' ? 'video/mp4' : 'image/jpeg';
    const gen = await analyzeAndGenerate(media.fileUrl, mimeType, { platform, contentType, audience, tone, goal });

    const analysis = await MediaAnalysis.create({ mediaId: media._id, ...gen.analysis });
    const content = await Content.create({
      userId: req.userId,
      mediaId: media._id,
      platform,
      contentType,
      caption: gen.caption,
      title: gen.title,
      description: gen.description,
      hashtags: gen.hashtags,
      keywords: gen.keywords,
      hook: gen.hook,
      cta: gen.cta,
      thumbnailText: gen.thumbnailText,
      tone: tone || '',
      audience: audience || '',
      goal: goal || '',
    });
    await logHistory(req.userId, content._id, 'created');
    res.status(201).json({ content, analysis });
  } catch (err) {
    next(err);
  }
});

// GET /api/content/history/mine — must be declared before /:id
router.get('/history/mine', async (req, res, next) => {
  try {
    const history = await ContentHistory.find({ userId: req.userId })
      .populate('contentId')
      .sort({ createdAt: -1 });
    res.json({ history });
  } catch (err) {
    next(err);
  }
});

// GET /api/content — current user's content
router.get('/', async (req, res, next) => {
  try {
    const items = await Content.find({ userId: req.userId }).populate('mediaId').sort({ createdAt: -1 });
    res.json({ content: items });
  } catch (err) {
    next(err);
  }
});

// GET /api/content/:id
router.get('/:id', async (req, res, next) => {
  try {
    const item = await Content.findOne({ _id: req.params.id, userId: req.userId }).populate('mediaId');
    if (!item) return res.status(404).json({ message: 'Content not found' });
    res.json({ content: item });
  } catch (err) {
    next(err);
  }
});

// PUT /api/content/:id — manual edit
router.put('/:id', async (req, res, next) => {
  try {
    const item = await Content.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ message: 'Content not found' });
    const fields = [
      'caption', 'title', 'description', 'hashtags', 'keywords',
      'hook', 'cta', 'thumbnailText', 'tone', 'audience', 'goal',
      'platform', 'contentType',
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) item[f] = req.body[f];
    });
    await item.save();
    await logHistory(req.userId, item._id, 'edited');
    res.json({ content: item });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/content/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const item = await Content.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ message: 'Content not found' });
    await item.deleteOne();
    res.json({ message: 'Content deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /api/content/:id/regenerate — re-call Gemini with same media + config
router.post('/:id/regenerate', async (req, res, next) => {
  try {
    const item = await Content.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ message: 'Content not found' });
    const media = await Media.findOne({ _id: item.mediaId, userId: req.userId });
    if (!media) return res.status(404).json({ message: 'Media not found for this content' });

    const cfg = {
      platform: req.body.platform || item.platform,
      contentType: req.body.contentType || item.contentType,
      audience: req.body.audience || item.audience,
      tone: req.body.tone || item.tone,
      goal: req.body.goal || item.goal,
    };
    const mimeType = media.mediaType === 'video' ? 'video/mp4' : 'image/jpeg';
    const gen = await analyzeAndGenerate(media.fileUrl, mimeType, cfg);

    Object.assign(item, {
      platform: cfg.platform,
      contentType: cfg.contentType,
      caption: gen.caption,
      title: gen.title,
      description: gen.description,
      hashtags: gen.hashtags,
      keywords: gen.keywords,
      hook: gen.hook,
      cta: gen.cta,
      thumbnailText: gen.thumbnailText,
      tone: cfg.tone || '',
      audience: cfg.audience || '',
      goal: cfg.goal || '',
    });
    await item.save();
    await MediaAnalysis.create({ mediaId: media._id, ...gen.analysis });
    await logHistory(req.userId, item._id, 'regenerated');
    res.json({ content: item });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
