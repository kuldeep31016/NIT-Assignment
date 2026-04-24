export default function LoadingSpinner({ small = false }) {
  const size = small ? 'h-4 w-4' : 'h-10 w-10';
  return (
    <div className="flex justify-center items-center py-4">
      <div className={`${size} animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600`} />
    </div>
  );
}
