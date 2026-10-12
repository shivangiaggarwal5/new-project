import { useState } from 'react';

const FIELDS = [
  { key: 'caption', label: 'Caption' },
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'hashtags', label: 'Hashtags' },
  { key: 'keywords', label: 'Keywords' },
  { key: 'hook', label: 'Hook' },
  { key: 'cta', label: 'CTA' },
  { key: 'thumbnailText', label: 'Thumbnail Text' }
];

function formatValue(v) {
  if (Array.isArray(v)) return v.join(' ');
  return v || '';
}

export default function ContentCards({ result, editable, draft, onDraftChange }) {
  const [copied, setCopied] = useState('');

  const copy = async (key, value) => {
    try {
      await navigator.clipboard.writeText(formatValue(value));
      setCopied(key);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      alert('Copy failed');
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {FIELDS.map(({ key, label }) => {
        const value = editable ? draft?.[key] : result?.[key];
        if (!editable && !value) return null;
        return (
          <div key={key} className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">{label}</h3>
              {!editable && (
                <button
                  onClick={() => copy(key, value)}
                  className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                >
                  {copied === key ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
            {editable ? (
              <textarea
                value={formatValue(draft?.[key])}
                onChange={(e) => onDraftChange({ ...draft, [key]: e.target.value })}
                rows={3}
                className="w-full border rounded p-2 text-sm"
              />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{formatValue(value)}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
