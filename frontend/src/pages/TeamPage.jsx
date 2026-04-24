import { useEffect, useState } from 'react';
import {
  UserPlusIcon,
  XMarkIcon,
  ClipboardIcon,
  UsersIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { fetchUsersApi, updateUserRoleApi } from '../api/userApi';
import { inviteApi } from '../api/authApi';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

function initials(name) {
  if (!name) return 'U';
  const parts = name.split(/\s+/);
  return (parts[0]?.[0] || 'U').toUpperCase() + (parts[1]?.[0]?.toUpperCase() || '');
}

export default function TeamPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitedPassword, setInvitedPassword] = useState('');
  const [inviteData, setInviteData] = useState({ name: '', email: '', role: 'member' });
  const [inviting, setInviting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await fetchUsersApi();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const changeRole = async (id, role) => {
    try {
      await updateUserRoleApi(id, { role });
      toast.success('Role updated');
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Role update failed');
    }
  };

  const invite = async (event) => {
    event.preventDefault();
    setInviting(true);
    try {
      const { data } = await inviteApi(inviteData);
      toast.success('Member invited');
      setInvitedPassword(data.temporaryPassword);
      setInviteData({ name: '', email: '', role: 'member' });
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invite failed');
    } finally {
      setInviting(false);
    }
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(invitedPassword);
      toast.success('Password copied');
    } catch {
      toast.error('Unable to copy');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Team</h1>
          <p className="mt-1 text-sm text-ink-500">Invite members and manage their roles.</p>
        </div>
        <button className="btn-primary" onClick={() => { setInviteOpen(true); setInvitedPassword(''); }}>
          <UserPlusIcon className="h-4 w-4" />
          Invite Member
        </button>
      </div>

      {invitedPassword && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
            <span>
              Temporary password:{' '}
              <span className="rounded-md bg-white px-2 py-0.5 font-mono text-emerald-700 ring-1 ring-emerald-200">
                {invitedPassword}
              </span>
            </span>
          </div>
          <button onClick={copyPassword} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900">
            <ClipboardIcon className="h-4 w-4" /> Copy
          </button>
        </div>
      )}

      <div className="card overflow-hidden">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <UsersIcon className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-ink-900">No members yet</h3>
            <p className="mt-1 text-sm text-ink-500">Invite your first teammate to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-ink-50/70 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                  <th className="px-5 py-3">Member</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {users.map((user) => (
                  <tr key={user.id} className="transition hover:bg-ink-50/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-semibold text-white">
                          {initials(user.name)}
                        </div>
                        <span className="font-semibold text-ink-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink-600">{user.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`chip ring-1 ${
                          user.role === 'admin'
                            ? 'bg-brand-50 text-brand-700 ring-brand-200'
                            : 'bg-ink-50 text-ink-700 ring-ink-200'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink-600">
                      {new Date(user.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <select
                        className="input w-auto py-1.5"
                        value={user.role}
                        onChange={(e) => changeRole(user.id, e.target.value)}
                      >
                        <option value="admin">admin</option>
                        <option value="member">member</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <form onSubmit={invite} className="w-full max-w-md rounded-2xl bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
              <h3 className="text-base font-semibold text-ink-900">Invite Member</h3>
              <button type="button" onClick={() => setInviteOpen(false)} className="rounded-lg p-1 text-ink-500 hover:bg-ink-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 px-6 py-5">
              <div>
                <label className="label">Name</label>
                <input value={inviteData.name} onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })} placeholder="Jane Doe" required className="input" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" value={inviteData.email} onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })} placeholder="jane@company.com" required className="input" />
              </div>
              <div>
                <label className="label">Role</label>
                <select value={inviteData.role} onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })} className="input">
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-ink-100 px-6 py-4">
              <button type="button" className="btn-secondary" onClick={() => setInviteOpen(false)} disabled={inviting}>
                Cancel
              </button>
              <button className="btn-primary" disabled={inviting}>
                {inviting ? 'Inviting...' : 'Send Invite'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
