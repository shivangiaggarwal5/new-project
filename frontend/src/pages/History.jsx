import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import Loader from '../components/Loader.jsx';

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // Backend: GET /api/history -> { history: [{ action, contentId: populated, createdAt }] }
        const { data } = await api.get('/history');
        const list = data.history || data.items || [];
        setItems(list);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader label="Loading history..." />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">History</h1>
      {items.length === 0 && <p className="text-sm text-gray-500">No history yet.</p>}
      <ul className="divide-y bg-white border rounded-lg px-4">
        {items.map((h) => {
          const item = h.contentId && typeof h.contentId === 'object' ? h.contentId : h;
          const cid = item._id || item.id;
          if (!cid) return null;
          return (
            <li key={h._id || h.id || cid} className="py-3 flex items-center justify-between text-sm gap-3">
              <div className="min-w-0">
                <div className="font-medium capitalize">
                  {item.platform} · {item.contentType}
                  {h.action && <span className="ml-2 text-xs text-gray-400">({h.action})</span>}
                </div>
                <div className="text-gray-500 truncate">{item.title || item.caption || 'Untitled'}</div>
              </div>
              <Link to={`/result/${cid}`} className="text-indigo-600 shrink-0">View</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
