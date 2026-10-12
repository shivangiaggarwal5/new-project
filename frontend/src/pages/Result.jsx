import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios.js';
import ContentCards from '../components/ContentCards.jsx';
import Loader from '../components/Loader.jsx';

export default function Result() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState(null);

  const fetchOne = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/content/${id}`);
      const item = data.content || data;
      setResult(item);
      setDraft(item);
      // Check saved state via /saved list (backend has no `saved` flag on Content)
      try {
        const { data: sData } = await api.get('/saved');
        const list = sData.saved || [];
        const match = list.find(
          (s) => (s.contentId?._id || s.contentId)?.toString() === (item._id || id)?.toString()
        );
        setSaved(!!match);
        setSavedId(match?._id || null);
      } catch {
        setSaved(false);
        setSavedId(null);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load result');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSaveEdit = async () => {
    setBusy('save-edit');
    try {
      const { data } = await api.put(`/content/${id}`, draft);
      const item = data.content || data;
      setResult(item);
      setEditing(false);
    } catch (err) {
      alert(err?.response?.data?.message || 'Update failed');
    } finally {
      setBusy('');
    }
  };

  const handleRegenerate = async () => {
    setBusy('regen');
    try {
      const { data } = await api.post(`/content/${id}/regenerate`);
      const item = data.content || data;
      setResult(item);
      setDraft(item);
      setEditing(false);
    } catch (err) {
      alert(err?.response?.data?.message || 'Regenerate failed');
    } finally {
      setBusy('');
    }
  };

  const handleToggleSave = async () => {
    setBusy('save');
    try {
      if (saved && savedId) {
        await api.delete(`/saved/${savedId}`);
        setSaved(false);
        setSavedId(null);
      } else {
        const { data } = await api.post('/saved', { contentId: id });
        setSaved(true);
        setSavedId(data.saved?._id || null);
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Save failed');
    } finally {
      setBusy('');
    }
  };

  if (loading) return <Loader label="Loading result..." />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!result) return <p className="text-sm text-gray-500">Not found.</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold capitalize">{result.platform} · {result.contentType}</h1>
          <p className="text-xs text-gray-500">{result.createdAt ? new Date(result.createdAt).toLocaleString() : ''}</p>
        </div>
        <div className="flex gap-2 text-sm">
          {!editing && (
            <button onClick={() => setEditing(true)} className="bg-white border px-3 py-1.5 rounded hover:border-gray-500">Edit</button>
          )}
          {editing && (
            <>
              <button onClick={() => { setEditing(false); setDraft(result); }} className="bg-white border px-3 py-1.5 rounded">Cancel</button>
              <button onClick={handleSaveEdit} disabled={busy === 'save-edit'} className="bg-indigo-600 text-white px-3 py-1.5 rounded disabled:opacity-60">
                {busy === 'save-edit' ? 'Saving...' : 'Save edits'}
              </button>
            </>
          )}
          <button onClick={handleRegenerate} disabled={!!busy} className="bg-white border px-3 py-1.5 rounded hover:border-gray-500 disabled:opacity-60">
            {busy === 'regen' ? 'Regenerating...' : 'Regenerate'}
          </button>
          <button onClick={handleToggleSave} disabled={busy === 'save'} className="bg-gray-900 text-white px-3 py-1.5 rounded disabled:opacity-60">
            {busy === 'save' ? '...' : saved ? 'Unsave' : 'Save'}
          </button>
        </div>
      </div>

      {(() => {
        const mediaUrl = result.mediaId?.fileUrl || result.mediaUrl || '';
        if (!mediaUrl) return null;
        return (
          <div>
            {result.mediaId?.mediaType === 'video' || /\.(mp4|mov|webm)$/i.test(mediaUrl) ? (
              <video src={mediaUrl} controls className="max-h-72 rounded border" />
            ) : (
              <img src={mediaUrl} alt="media" className="max-h-72 rounded border" />
            )}
          </div>
        );
      })()}

      <ContentCards result={result} editable={editing} draft={draft} onDraftChange={setDraft} />
    </div>
  );
}
