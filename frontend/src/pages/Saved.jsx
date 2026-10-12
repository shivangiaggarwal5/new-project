import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import Loader from '../components/Loader.jsx';

export default function Saved() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/saved');
        // GET /api/saved -> { saved: [{ _id, contentId: populated Content, ... }] }
        const list = data.saved || data.items || [];
        setItems(list);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load saved content');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUnsave = async (savedId) => {
    try {
      await api.delete(`/saved/${savedId}`);
      setItems((prev) => prev.filter((s) => (s._id || s.id) !== savedId));
    } catch (err) {
      alert(err?.response?.data?.message || 'Unsave failed');
    }
  };

  if (loading) return <Loader label="Loading saved content..." />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Saved Content</h1>
      {items.length === 0 && <p className="text-sm text-gray-500">Nothing saved yet.</p>}
      <ul className="grid gap-3 md:grid-cols-2">
        {items.map((s) => {
          const item = s.contentId && typeof s.contentId === 'object' ? s.contentId : s;
          const cid = item._id || item.id;
          return (
            <li key={s._id || s.id} className="bg-white border rounded-lg p-4">
              <div className="text-xs text-gray-500 capitalize">{item.platform} · {item.contentType}</div>
              <div className="text-sm font-medium truncate mt-1">{item.title || item.caption || 'Untitled'}</div>
              <div className="mt-2 flex gap-3 text-sm">
                <Link to={`/result/${cid}`} className="text-indigo-600">Open</Link>
                <button onClick={() => handleUnsave(s._id || s.id)} className="text-red-600">Unsave</button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
