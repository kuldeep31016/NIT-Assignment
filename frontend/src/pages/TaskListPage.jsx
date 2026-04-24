import { useEffect, useMemo, useState } from 'react';
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { deleteTaskApi, fetchTasksApi } from '../api/taskApi';
import { fetchUsersApi } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function TaskListPage() {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', priority: '', search: '' });
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ data: tasksData }, { data: usersData }] = await Promise.all([
        fetchTasksApi(filter),
        fetchUsersApi().catch(() => ({ data: [] }))
      ]);
      setTasks(tasksData);
      setUsers(usersData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter.status, filter.priority, filter.search]);

  const canEdit = (task) => isAdmin || task.createdBy === user?.userId;
  const filteredTasks = useMemo(() => tasks, [tasks]);
  const activeFilters = Boolean(filter.status || filter.priority || filter.search);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteTaskApi(deleteTask.id);
      toast.success('Task deleted');
      setDeleteTask(null);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Tasks</h1>
          <p className="mt-1 text-sm text-ink-500">Manage your team's tasks — create, assign and track progress.</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary">
          <PlusIcon className="h-4 w-4" />
          New Task
        </button>
      </div>

      <div className="card card-body">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              placeholder="Search tasks by title..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="input pl-9"
            />
          </div>
          <div className="flex items-center gap-2 text-ink-500">
            <FunnelIcon className="h-4 w-4" />
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="input w-auto py-2"
            >
              <option value="">All Statuses</option>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <select
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
              className="input w-auto py-2"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {activeFilters && (
              <button
                onClick={() => setFilter({ status: '', priority: '', search: '' })}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <ClipboardDocumentListIcon className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-ink-900">
              {activeFilters ? 'No tasks match your filters' : 'No tasks yet 🚀'}
            </h3>
            <p className="mt-1 max-w-xs text-sm text-ink-500">
              {activeFilters ? 'Try adjusting your filters or clear them to see all tasks.' : 'Click "New Task" to create your first task.'}
            </p>
            {!activeFilters && (
              <button onClick={() => setCreateOpen(true)} className="btn-primary mt-4">
                <PlusIcon className="h-4 w-4" />
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-ink-50/70 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Assigned</th>
                  <th className="px-5 py-3">Due</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="transition hover:bg-ink-50/60">
                    <td className="px-5 py-4">
                      <Link to={`/tasks/${task.id}`} className="font-semibold text-ink-900 hover:text-brand-600">
                        {task.title}
                      </Link>
                      {task.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">{task.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-5 py-4">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-5 py-4">
                      {task.assigneeName ? (
                        <span className="inline-flex items-center gap-2 text-ink-700">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[11px] font-semibold text-brand-700">
                            {task.assigneeName.trim()[0]?.toUpperCase() || '?'}
                          </span>
                          {task.assigneeName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-ink-400">
                          <UserIcon className="h-4 w-4" /> Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-ink-600">
                      {task.dueDate ? (
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDaysIcon className="h-4 w-4 text-ink-400" />
                          {new Date(task.dueDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        {canEdit(task) && (
                          <button
                            onClick={() => setEditTask(task)}
                            className="rounded-lg p-2 text-brand-600 transition hover:bg-brand-50"
                            title="Edit"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTask(task)}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateTaskModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSuccess={loadData} users={users} />
      <EditTaskModal isOpen={Boolean(editTask)} onClose={() => setEditTask(null)} onSuccess={loadData} users={users} task={editTask} />
      <ConfirmDialog isOpen={Boolean(deleteTask)} title="Delete this task?" message="This action cannot be undone." onCancel={() => setDeleteTask(null)} onConfirm={confirmDelete} loading={deleting} />
    </div>
  );
}
