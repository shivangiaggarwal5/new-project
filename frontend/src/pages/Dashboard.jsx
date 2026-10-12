import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import Loader from '../components/Loader.jsx';

export default function Dashboard() {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/content', { params: { limit: 5 } });
        const list = data.content || data.items || data.history || [];
        setRecent(Array.isArray(list) ? list.slice(0, 5) : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load recent content');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">Create platform-ready content in seconds.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Link to="/generate" className="bg-indigo-600 text-white rounded-lg p-4 hover:bg-indigo-500">
          <div className="font-semibold">+ New Content</div>
          <div className="text-xs opacity-80">Upload & generate</div>
        </Link>
        <Link to="/saved" className="bg-white border rounded-lg p-4 hover:border-indigo-400">
          <div className="font-semibold">Saved Content</div>
          <div className="text-xs text-gray-500">View saved ideas</div>
        </Link>
        <Link to="/history" className="bg-white border rounded-lg p-4 hover:border-indigo-400">
          <div className="font-semibold">History</div>
          <div className="text-xs text-gray-500">All generations</div>
        </Link>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Recent content</h2>
        {loading && <Loader label="Loading recent content..." />}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && recent.length === 0 && (
          <p className="text-sm text-gray-500">No content yet. <Link to="/generate" className="text-indigo-600">Generate your first post</Link>.</p>
        )}
        <ul className="divide-y">
          {recent.map((item) => (
            <li key={item._id || item.id} className="py-2 flex items-center justify-between text-sm">
              <span className="truncate">
                <span className="font-medium capitalize">{item.platform}</span>
                {' · '}
                <span className="text-gray-500">{item.contentType} · {(item.title || item.caption || 'Untitled').slice(0, 60)}</span>
              </span>
              <Link to={`/result/${item._id || item.id}`} className="text-indigo-600 ml-3 shrink-0">View</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
