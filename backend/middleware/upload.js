const multer = require('multer');

// In-memory storage: file buffer is streamed to Cloudinary, nothing saved to disk
const storage = multer.memoryStorage();

const ALLOWED_MIMES = new Set([
  // images
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  // videos
  'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm',
]);

function fileFilter(req, file, cb) {
  if (ALLOWED_MIMES.has(file.mimetype)) return cb(null, true);
  cb(new Error('Only image/video files are allowed'));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per SRS
});

module.exports = upload;
