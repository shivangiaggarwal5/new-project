const mongoose = require('mongoose');
const config = require('./config/env');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const mediaRoutes = require('./routes/media');
const contentRoutes = require('./routes/content');
const savedRoutes = require('./routes/saved');
const historyRoutes = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/history', historyRoutes);

// Central error handler (incl. multer fileSize / fileFilter errors)
app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large (max 50MB)' });
  }
  if (err.message === 'Only image/video files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// connectDB()
//   .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
//   .catch((err) => {
//     console.error('DB connection failed:', err.message);
//     process.exit(1);
//   });

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))