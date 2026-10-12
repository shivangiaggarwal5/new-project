const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
  { id: 'facebook', label: 'Facebook', icon: '📘' }
];

export default function PlatformCards({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {PLATFORMS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onSelect(p.id)}
          className={`border rounded-lg p-3 text-center transition ${
            selected === p.id
              ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
              : 'border-gray-200 bg-white hover:border-gray-400'
          }`}
        >
          <div className="text-2xl">{p.icon}</div>
          <div className="text-sm font-medium mt-1">{p.label}</div>
        </button>
      ))}
    </div>
  );
}
