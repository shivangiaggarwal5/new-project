import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const FEATURES = [
  { title: 'AI Media Analysis', desc: 'Objects, scene, mood, category and keywords detected from your image or video.' },
  { title: 'Platform Optimization', desc: 'Captions for Instagram, titles + SEO descriptions for YouTube, conversational posts for Facebook.' },
  { title: 'Hashtags & Keywords', desc: 'Relevant hashtags, keywords, hooks and CTAs generated for every post.' },
  { title: 'Edit & Regenerate', desc: 'Tweak any output, regenerate a fresh version, copy or save it in one click.' },
  { title: 'Content History', desc: 'Every generation is logged so you can revisit and reuse past ideas.' },
  { title: 'Saved Library', desc: 'Bookmark your best outputs and build a reusable content library.' },
];

const STEPS = ['Upload media', 'Pick platform & content type', 'Set audience, tone & goal', 'Generate, edit & save'];

export default function Home() {
  const { token } = useAuth();

  return (
    <div className="space-y-10">
      <section className="text-center bg-white border rounded-xl px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Create scroll-stopping social content with <span className="text-indigo-600">AI</span>
        </h1>
        <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
          Upload an image or video, pick Instagram, YouTube or Facebook — SocialBoost AI writes
          platform-ready captions, titles, hashtags, hooks and CTAs in seconds.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {token ? (
            <>
              <Link to="/generate" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-500">
                Generate content
              </Link>
              <Link to="/dashboard" className="bg-white border px-5 py-2.5 rounded-lg text-sm font-medium hover:border-indigo-400">
                Go to dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-500">
                Get started free
              </Link>
              <Link to="/login" className="bg-white border px-5 py-2.5 rounded-lg text-sm font-medium hover:border-indigo-400">
                Login
              </Link>
            </>
          )}
        </div>
        <div className="mt-4 flex justify-center gap-2 text-xs text-gray-500">
          <span className="bg-gray-100 rounded-full px-3 py-1">Instagram</span>
          <span className="bg-gray-100 rounded-full px-3 py-1">YouTube</span>
          <span className="bg-gray-100 rounded-full px-3 py-1">Facebook</span>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">How it works</h2>
        <ol className="grid sm:grid-cols-4 gap-3">
          {STEPS.map((s, i) => (
            <li key={s} className="bg-white border rounded-lg p-4 text-sm">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center mb-2">{i + 1}</div>
              {s}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white border rounded-lg p-4">
              <div className="font-semibold text-sm">{f.title}</div>
              <div className="text-sm text-gray-500 mt-1">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900 text-white rounded-xl px-6 py-10 text-center">
        <h2 className="text-xl font-bold">Stop staring at a blank caption box</h2>
        <p className="text-sm text-gray-300 mt-2">Generate your first optimized post in under a minute.</p>
        <Link
          to={token ? '/generate' : '/register'}
          className="inline-block mt-4 bg-indigo-600 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-500"
        >
          {token ? 'Create now' : 'Create free account'}
        </Link>
      </section>
    </div>
  );
}
