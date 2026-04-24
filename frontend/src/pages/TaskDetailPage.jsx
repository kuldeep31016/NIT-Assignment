import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ClockIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { fetchTaskApi, fetchTaskAuditApi } from '../api/taskApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

const ACTION_STYLES = {
  CREATED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  UPDATED: 'bg-blue-50 text-blue-700 ring-blue-200',
  STATUS_CHANGED: 'bg-violet-50 text-violet-700 ring-violet-200',
  DELETED: 'bg-red-50 text-red-700 ring-red-200'
};

export default function TaskDetailPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [task, setTask] = useState(null);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchTaskApi(id);
        setTask(data);
        if (isAdmin) {
          const { data: auditData } = await fetchTaskAuditApi(id);
          setAudit(auditData);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isAdmin]);

  if (loading) return <LoadingSpinner />;
  if (!task) return <p className="text-ink-600">Task not found.</p>;

  return (
    <div className="space-y-5">
      <Link to="/tasks" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
        <ArrowLeftIcon className="h-4 w-4" /> Back to tasks
      </Link>

      <div className="card card-body">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-ink-900">{task.title}</h1>
            <p className="mt-2 text-sm text-ink-600">
              {task.description || <span className="italic text-ink-400">No description provided.</span>}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-ink-100 pt-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Assigned to</p>
            <p className="mt-1 text-sm font-medium text-ink-900">{task.assigneeName || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Due date</p>
            <p className="mt-1 text-sm font-medium text-ink-900">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Created</p>
            <p className="mt-1 text-sm font-medium text-ink-900">
              {task.created_at ? new Date(task.created_at).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="card">
          <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-4 sm:px-6">
            <ClockIcon className="h-5 w-5 text-ink-500" />
            <h2 className="text-base font-semibold text-ink-900">Audit timeline</h2>
          </div>
          {audit.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
              <ClipboardDocumentCheckIcon className="h-8 w-8 text-ink-300" />
              <p className="mt-2 text-sm text-ink-500">No audit events yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-ink-100">
              {audit.map((entry) => (
                <li key={entry.id} className="px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`chip ring-1 ${ACTION_STYLES[entry.action] || 'bg-ink-50 text-ink-700 ring-ink-200'}`}>
                      {entry.action.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-ink-500">
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink-700">
                    by <span className="font-semibold">{entry.performed_by_name}</span>
                  </p>
                  {entry.new_values && (
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-700">
                      {JSON.stringify(entry.new_values, null, 2)}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
