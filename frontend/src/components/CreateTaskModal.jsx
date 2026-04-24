import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createTaskApi } from '../api/taskApi';
import { toast } from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

export default function CreateTaskModal({ isOpen, onClose, onSuccess, users }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const onChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await createTaskApi(form);
      toast.success('Task created successfully');
      onSuccess();
      onClose();
      setForm({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <form onSubmit={onSubmit} className="w-full max-w-lg rounded-2xl bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <h3 className="text-base font-semibold text-ink-900">Create Task</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-ink-500 hover:bg-ink-100">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="label">Title</label>
            <input name="title" value={form.title} onChange={onChange} required placeholder="e.g. Design onboarding flow" className="input" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={onChange} placeholder="Add more context..." rows={3} className="input" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Priority</label>
              <select name="priority" value={form.priority} onChange={onChange} className="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
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
              <input name="dueDate" value={form.dueDate} onChange={onChange} type="date" className="input" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-ink-100 px-6 py-4">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <LoadingSpinner small /> : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
