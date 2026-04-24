import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  Squares2X2Icon,
  ClipboardDocumentCheckIcon,
  UsersIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

function initialsFrom(value) {
  if (!value) return 'U';
  const parts = value.split(/[\s@.]+/).filter(Boolean);
  return (parts[0]?.[0] || 'U').toUpperCase() + (parts[1]?.[0]?.toUpperCase() || '');
}

export default function Navbar({ orgName = 'Task Manager' }) {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-brand-600 text-white shadow-soft'
        : 'text-ink-300 hover:bg-white/5 hover:text-white'
    }`;

  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: Squares2X2Icon },
    { to: '/tasks', label: 'Tasks', icon: ClipboardDocumentCheckIcon },
    ...(isAdmin ? [{ to: '/team', label: 'Team', icon: UsersIcon }] : []),
    { to: '/profile', label: 'Profile', icon: UserCircleIcon }
  ];

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 rounded-lg bg-ink-900 p-2 text-white shadow-lg md:hidden"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-72 flex-col bg-ink-900 text-white transition-transform md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-3 px-6 pt-6 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-soft">
            <SparklesIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">Task Manager</h1>
            <p className="text-xs text-ink-400">{orgName}</p>
          </div>
        </div>

        <div className="mx-6 mt-2 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-semibold">
              {initialsFrom(user?.email)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.email || 'Account'}</p>
              <span className="mt-0.5 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                {user?.role || 'member'}
              </span>
            </div>
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-1 px-4">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navLinkClass} onClick={() => setOpen(false)}>
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 pb-6">
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
