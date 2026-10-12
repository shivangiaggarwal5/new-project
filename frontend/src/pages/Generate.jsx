import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import PlatformCards from '../components/PlatformCards.jsx';

const CONTENT_TYPES = {
  instagram: ['Post', 'Reel', 'Story'],
  youtube: ['Video', 'Short'],
  facebook: ['Post', 'Reel', 'Video']
};

export default function Generate() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [platform, setPlatform] = useState('instagram');
  const [contentType, setContentType] = useState('Post');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const handlePlatform = (p) => {
    setPlatform(p);
    setContentType(CONTENT_TYPES[p][0]);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose an image or video first.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Step 1: upload media (field "media") -> get mediaId
      const fd = new FormData();
      fd.append('media', file);
      const { data: upData } = await api.post('/media/upload', fd);
      const mediaId = upData.media?._id || upData.media?.id || upData._id || upData.id;
      if (!mediaId) throw new Error('Upload did not return a media id');
      // Step 2: generate content from uploaded media
      const { data } = await api.post('/content/generate', {
        mediaId,
        platform,
        contentType,
        audience,
        tone,
        goal,
      });
      const id = data.content?._id || data.content?.id || data._id || data.id;
      if (id) navigate(`/result/${id}`);
      else navigate('/dashboard', { state: { generated: data } });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border rounded-lg p-6">
      <h1 className="text-xl font-bold mb-4">Upload & Generate</h1>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2 mb-3">{error}</p>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Media</label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-1 w-full text-sm"
          />
          {preview && (
            <div className="mt-2">
              {file?.type?.startsWith('video') ? (
                <video src={preview} controls className="max-h-64 rounded border" />
              ) : (
                <img src={preview} alt="preview" className="max-h-64 rounded border" />
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Platform</label>
          <div className="mt-1">
            <PlatformCards selected={platform} onSelect={handlePlatform} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Content type</label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="mt-1 w-full border rounded p-2 text-sm"
          >
            {CONTENT_TYPES[platform].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium">Audience</label>
            <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. fitness beginners" className="mt-1 w-full border rounded p-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Tone</label>
            <input value={tone} onChange={(e) => setTone(e.target.value)} placeholder="e.g. friendly" className="mt-1 w-full border rounded p-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Goal</label>
            <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. engagement" className="mt-1 w-full border rounded p-2 text-sm" />
          </div>
        </div>

        <button disabled={loading} className="w-full bg-indigo-600 text-white rounded py-2 text-sm hover:bg-indigo-500 disabled:opacity-60">
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </form>
    </div>
  );
}
