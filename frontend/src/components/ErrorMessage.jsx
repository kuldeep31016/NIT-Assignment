import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
