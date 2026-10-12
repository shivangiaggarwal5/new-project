require('dotenv').config();
const connectDB = require('../config/db');
const Platform = require('../models/Platform');

const DEFAULTS = [
  { name: 'instagram', types: ['reel', 'post', 'story'] },
  { name: 'youtube', types: ['short', 'video', 'thumbnail'] },
  { name: 'facebook', types: ['post', 'reel', 'story'] },
];

async function seed() {
  await connectDB();
  for (const p of DEFAULTS) {
    await Platform.findOneAndUpdate({ name: p.name }, { $set: p }, { upsert: true });
  }
  console.log('Platforms seeded');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
