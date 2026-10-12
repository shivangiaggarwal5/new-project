const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

// Lazily create the client so missing keys fail only when AI is called
function getGenAI() {
  if (genAI) return genAI;
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not defined in environment');
  genAI = new GoogleGenerativeAI(key);
  return genAI;
}

module.exports = { getGenAI };
