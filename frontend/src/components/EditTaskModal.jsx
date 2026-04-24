import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { updateTaskApi } from '../api/taskApi';
import { toast } from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

export default function EditTaskModal({ isOpen, onClose, onSuccess, users, task }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo', assignedTo: '', dueDate: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        assignedTo: task.assignedTo || '',
        dueDate: task.dueDate || ''
      });
    }
  }, [task]);

  if (!isOpen || !task) return null;
  const onChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await updateTaskApi(task.id, form);
      toast.success('Task updated');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <form onSubmit={onSubmit} className="w-full max-w-lg rounded-2xl bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <h3 className="text-base font-semibold text-ink-900">Edit Task</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-ink-500 hover:bg-ink-100">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="label">Title</label>
            <input name="title" value={form.title} onChange={onChange} required className="input" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={onChange} rows={3} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Priority</label>
              <select name="priority" value={form.priority} onChange={onChange} className="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" value={form.status} onChange={onChange} className="input">
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="label">Assignee</label>
              <select name="assignedTo" value={form.assignedTo} onChange={onChange} className="input">
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input name="dueDate" value={form.dueDate || ''} onChange={onChange} type="date" className="input" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-ink-100 px-6 py-4">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <LoadingSpinner small /> : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
