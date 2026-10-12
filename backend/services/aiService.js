const { getGenAI } = require('../config/gemini');
const { buildPrompt, buildAnalysisSchema } = require('../utils/prompts');

const MODEL_NAME = 'gemini-1.5-flash';

// Fetch a remote file (Cloudinary URL) into a Buffer for inlineData
async function fetchToBuffer(fileUrl) {
  const res = await fetch(fileUrl);
  if (!res.ok) throw new Error(`Failed to fetch media: ${res.status}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

function normaliseResult(parsed, rawText) {
  const analysis = parsed.analysis && typeof parsed.analysis === 'object' ? parsed.analysis : {};
  const arr = (v) => (Array.isArray(v) ? v.map(String) : []);
  const str = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v));
  return {
    analysis: {
      objects: arr(analysis.objects),
      scene: str(analysis.scene),
      mood: str(analysis.mood),
      category: str(analysis.category),
      keywords: arr(analysis.keywords),
      detectedText: str(analysis.detectedText),
    },
    caption: str(parsed.caption),
    title: str(parsed.title),
    description: str(parsed.description || parsed.caption),
    hashtags: arr(parsed.hashtags),
    keywords: arr(parsed.keywords),
    hook: str(parsed.hook),
    cta: str(parsed.cta),
    thumbnailText: str(parsed.thumbnailText),
    _raw: rawText,
  };
}

// Robust JSON parse: strip code fences, extract first {...} block, fallback to raw text
function parseJsonRobust(text) {
  const cleaned = String(text || '').replace(/```json|```/g, '').trim();
  try {
    return { parsed: JSON.parse(cleaned), raw: text };
  } catch (e) { /* fall through */ }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      return { parsed: JSON.parse(cleaned.slice(start, end + 1)), raw: text };
    } catch (e) { /* fall through */ }
  }
  // Fallback: treat whole response as caption so the request still succeeds
  return {
    parsed: { caption: cleaned, title: '', description: cleaned },
    raw: text,
  };
}

/**
 * Analyse media + generate content via Gemini multimodal.
 * @param {Buffer|string} mediaInput - Buffer (from multer) or remote URL string
 * @param {string} mimeType - e.g. image/jpeg, video/mp4
 * @param {object} promptConfig - { platform, contentType, audience, tone, goal }
 */
async function analyzeAndGenerate(mediaInput, mimeType, promptConfig) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: { responseMimeType: 'application/json' },
  });

  const textPrompt = `${buildPrompt(promptConfig)}\n\n${buildAnalysisSchema()}`;

  let buffer = null;
  if (Buffer.isBuffer(mediaInput)) {
    buffer = mediaInput;
  } else if (typeof mediaInput === 'string' && mediaInput.startsWith('http')) {
    buffer = await fetchToBuffer(mediaInput);
  } else {
    throw new Error('mediaInput must be a Buffer or a remote file URL');
  }

  const isVideo = (mimeType || '').startsWith('video');
  // For images use inlineData base64; for video/remote use fileData with
  // base64 fallback — inlineData keeps this working without File API uploads.
  let mediaPart;
  if (!isVideo) {
    mediaPart = {
      inlineData: { data: buffer.toString('base64'), mimeType: mimeType || 'image/jpeg' },
    };
  } else if (typeof mediaInput === 'string' && mediaInput.startsWith('http')) {
    mediaPart = { fileData: { fileUri: mediaInput, mimeType: mimeType || 'video/mp4' } };
  } else {
    mediaPart = {
      inlineData: { data: buffer.toString('base64'), mimeType: mimeType || 'video/mp4' },
    };
  }

  const result = await model.generateContent([textPrompt, mediaPart]);
  const text = result.response.text();
  const { parsed } = parseJsonRobust(text);
  return normaliseResult(parsed, text);
}

module.exports = { analyzeAndGenerate };
