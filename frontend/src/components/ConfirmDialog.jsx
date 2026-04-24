import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

export default function ConfirmDialog({ isOpen, title, message, onCancel, onConfirm, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-card">
        <div className="flex items-start gap-4 px-6 pt-6">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ExclamationTriangleIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink-900">{title}</h3>
            <p className="mt-1 text-sm text-ink-600">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-5">
          <button className="btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <LoadingSpinner small /> : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
