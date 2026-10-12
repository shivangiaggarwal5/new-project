// Centralised prompt builders for Gemini calls.

const PLATFORM_GUIDANCE = {
  instagram:
    'Instagram: short punchy caption (max ~2200 chars, front-load hook), 8-15 relevant hashtags, strong first-line hook, CTA optimised for saves/shares/comments. Suggest Reel/post thumbnail text overlay.',
  youtube:
    'YouTube: click-worthy title (under 70 chars), 2-3 sentence SEO description with keywords, 5-8 tags/keywords, strong hook for first 5 seconds, CTA to subscribe/watch-next, thumbnail text (3-5 words, high contrast wording).',
  facebook:
    'Facebook: conversational caption suited to feed + groups, 2-5 hashtags max, storytelling description, community-driven CTA (comment/share), thumbnail/post headline text.',
};

// Build the main multimodal instruction for analyse + generate in one call
function buildPrompt({ platform, contentType, audience, tone, goal }) {
  const p = (platform || '').toLowerCase();
  const platformRule = PLATFORM_GUIDANCE[p] || 'General social media post.';
  return [
    'You are SocialBoost AI, an expert social-media analyst and copywriter.',
    'Step 1: Carefully analyse the attached media (image or video frame(s)). Identify visible objects, setting/scene, mood, category/niche, any visible text, and dominant colours/subjects.',
    `Step 2: Generate ${contentType || 'post'} content for ${p || 'social media'} using that visual analysis.`,
    `Target audience: ${audience || 'general audience'}.`,
    `Tone: ${tone || 'engaging'}.`,
    `Goal: ${goal || 'maximise engagement'}.`,
    `Platform rules: ${platformRule}`,
    'Return ONLY the JSON object described in the schema instruction — no markdown fences, no commentary.',
  ].join('\n');
}

// Instruct the model to return strict JSON so the backend can parse reliably
function buildAnalysisSchema() {
  return [
    'Respond with a single JSON object with EXACTLY these keys:',
    '{',
    '  "analysis": { "objects": string[], "scene": string, "mood": string, "category": string, "keywords": string[], "detectedText": string },',
    '  "caption": string,',
    '  "title": string,',
    '  "description": string,',
    '  "hashtags": string[],',
    '  "keywords": string[],',
    '  "hook": string,',
    '  "cta": string,',
    '  "thumbnailText": string',
    '}',
    'Rules: arrays contain plain strings without "#" prefix on hashtags entries (backend adds display as-is); keep strings concise; use "" when a field does not apply (e.g. title for Instagram).',
  ].join('\n');
}

module.exports = { buildPrompt, buildAnalysisSchema };
