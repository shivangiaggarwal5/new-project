export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-2 text-gray-600">
      <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
