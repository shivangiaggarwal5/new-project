# SocialBoost AI — AI-powered Social Media Content Optimization Platform

MERN + Gemini + Cloudinary. Per SRS: upload image/video → select platform (Instagram/YouTube/Facebook) → content type → AI analysis + platform-specific captions, titles, descriptions, hashtags, keywords, hooks, CTAs → edit/regenerate/save/copy → history.

## Structure

```
backend/   Node + Express + Mongoose + JWT + Multer + Cloudinary + Gemini
frontend/  React (Vite) + React Router + Axios + Tailwind v3
```

## Prerequisites

- Node.js 18+, MongoDB (local or Atlas)
- Google Gemini API key → https://aistudio.google.com/apikey
- Cloudinary account → https://cloudinary.com (Cloud name, API key, secret)

## Setup

### 1. Backend

```powershell
cd backend
Copy-Item .env.example .env   # then fill in values
npm install
npm run seed   # upserts instagram/youtube/facebook platforms
npm run dev    # http://localhost:5000, health at /health
```

Required `.env`:

```
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/socialboost-ai
JWT_SECRET=<long random string>
GEMINI_API_KEY=<your key>
CLOUDINARY_CLOUD_NAME=<...>
CLOUDINARY_API_KEY=<...>
CLOUDINARY_API_SECRET=<...>
```

### 2. Frontend

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev    # http://localhost:5173
```

`.env`:

```
VITE_API_URL=http://localhost:5000/api
```

## API (per SRS Appendix B)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/register | Register (name, email, password) |
| POST | /api/auth/login | Login → JWT |
| POST | /api/auth/logout | Logout (client clears token) |
| GET | /api/auth/profile | Profile (protected) |
| POST | /api/media/upload | Upload `media` field, ≤50MB image/video → Cloudinary |
| GET | /api/media, /api/media/:id | List / get own media |
| DELETE | /api/media/:id | Delete own media |
| POST | /api/content/generate | { mediaId, platform, contentType, audience, tone, goal } → Gemini |
| GET | /api/content, /api/content/:id | List / get |
| PUT / DELETE | /api/content/:id | Edit / delete |
| POST | /api/content/:id/regenerate | Re-run Gemini |
| GET | /api/content/history/mine, /api/history | History |
| POST / GET / DELETE | /api/saved | Save / list / unsave |

## Flow

Login → Generate (`/generate`: upload → platform cards → content type → audience/tone/goal → Generate) → Result (`/result/:id`: copy/edit/regenerate/save) → Saved (`/saved`) → History (`/history`).

## Notes

- Gemini model: `gemini-1.5-flash`, JSON mode, one call does analysis + generation (`backend/services/aiService.js`, prompts in `backend/utils/prompts.js`).
- Images sent as `inlineData` base64; videos via Cloudinary `fileUri` with buffer fallback.
- Uploads: Multer memory storage → Cloudinary `resource_type: auto`.
- Auth: JWT Bearer, bcrypt hashing, protected routes on both layers.
