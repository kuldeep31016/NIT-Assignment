import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { fetchTasksApi } from '../api/taskApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

const CARD_STYLES = {
  total: {
    icon: Squares2X2Icon,
    bg: 'bg-blue-50',
    ring: 'ring-blue-100',
    iconBg: 'bg-blue-500/10 text-blue-600',
    text: 'text-blue-700'
  },
  todo: {
    icon: ClipboardDocumentListIcon,
    bg: 'bg-amber-50',
    ring: 'ring-amber-100',
    iconBg: 'bg-amber-500/10 text-amber-600',
    text: 'text-amber-700'
  },
  in_progress: {
    icon: ClockIcon,
    bg: 'bg-purple-50',
    ring: 'ring-purple-100',
    iconBg: 'bg-purple-500/10 text-purple-600',
    text: 'text-purple-700'
  },
  done: {
    icon: CheckCircleIcon,
    bg: 'bg-green-50',
    ring: 'ring-green-100',
    iconBg: 'bg-green-500/10 text-green-600',
    text: 'text-green-700'
  }
};

function StatCard({ type, label, value }) {
  const s = CARD_STYLES[type];
  const Icon = s.icon;
  return (
    <div className={`rounded-xl ${s.bg} ring-1 ${s.ring} p-5 transition hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">{label}</p>
          <p className={`mt-3 text-3xl font-bold ${s.text}`}>{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${s.iconBg}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchTasksApi();
        setTasks(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  const total = tasks.length;
  const todo = tasks.filter((task) => task.status === 'todo').length;
  const inProgress = tasks.filter((task) => task.status === 'in_progress').length;
  const done = tasks.filter((task) => task.status === 'done').length;
  const recent = tasks.slice(0, 6);
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const name = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {greeting}, {name}
          </h1>
          <p className="mt-2 text-sm text-slate-600">Here's an overview of your team's tasks</p>
        </div>
        <Link to="/tasks" className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700">
          <PlusIcon className="h-4 w-4" />
          Create Task
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard type="total" label="Total Tasks" value={total} />
        <StatCard type="todo" label="To Do" value={todo} />
        <StatCard type="in_progress" label="In Progress" value={inProgress} />
        <StatCard type="done" label="Done" value={done} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent Tasks</h2>
            <p className="mt-0.5 text-sm text-slate-600">Latest activity from your team</p>
          </div>
          <Link to="/tasks" className="text-sm font-semibold text-amber-600 transition hover:text-amber-700">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <ClipboardDocumentListIcon className="h-8 w-8" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-slate-900">No tasks yet</h3>
            <p className="mt-2 max-w-sm text-sm text-slate-600">
              Create your first task to get started organizing your team's work
            </p>
            <Link to="/tasks" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700">
              <PlusIcon className="h-4 w-4" />
              Create your first task
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((task) => (
              <li key={task.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <Link to={`/tasks/${task.id}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-amber-600 transition">
                    {task.title}
                  </Link>
                  {task.description && (
                    <p className="mt-1 truncate text-xs text-slate-600">{task.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                  {task.dueDate && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      <CalendarDaysIcon className="h-3.5 w-3.5" />
                      {new Date(task.dueDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
