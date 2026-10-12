import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
  const message = err?.response?.data?.message;

  if (message?.includes('buffering timed out') ||
      message?.includes('users.findOne()')) {
    setError('Something went wrong. Please try again.');
  } else {
    setError(message || 'Something went wrong. Please try again.');
  }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border rounded-lg p-6 mt-8">
      <h1 className="text-xl font-bold mb-4">Register</h1>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2 mb-3">{error}</p>}
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full border rounded p-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full border rounded p-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full border rounded p-2 text-sm"
          />
        </div>
        <button disabled={loading} className="w-full bg-indigo-600 text-white rounded py-2 text-sm hover:bg-indigo-500 disabled:opacity-60">
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="text-sm mt-3">
        Have an account? <Link to="/login" className="text-indigo-600">Login</Link>
      </p>
    </div>
  );
}
