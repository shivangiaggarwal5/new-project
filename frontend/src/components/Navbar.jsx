import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg text-indigo-600">
          SocialBoost AI
        </Link>
        {token ? (
          <div className="flex items-center gap-3 text-sm">
            <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
            <Link to="/generate" className="hover:text-indigo-600">Generate</Link>
            <Link to="/saved" className="hover:text-indigo-600">Saved</Link>
            <Link to="/history" className="hover:text-indigo-600">History</Link>
            <span className="hidden sm:inline text-gray-500">{user?.name || user?.email}</span>
            <button onClick={handleLogout} className="bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-gray-700">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-3 text-sm items-center">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <Link to="/login" className="hover:text-indigo-600">Login</Link>
            <Link to="/register" className="bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-500">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
