import { useEffect, useState } from 'react';
import { UserCircleIcon, EnvelopeIcon, BuildingOffice2Icon, ShieldCheckIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { meApi } from '../api/authApi';
import { updateProfileApi } from '../api/userApi';
import LoadingSpinner from '../components/LoadingSpinner';

function initials(name) {
  if (!name) return 'U';
  const parts = name.split(/\s+/);
  return (parts[0]?.[0] || 'U').toUpperCase() + (parts[1]?.[0]?.toUpperCase() || '');
}

function InfoField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50/40 px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-amber-600 ring-1 ring-amber-100">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-900">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await meApi();
        setProfile(data);
        setFormData({ name: data.name, email: data.email });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ name: profile.name, email: profile.email });
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    setIsSaving(true);
    try {
      const { data } = await updateProfileApi({
        name: formData.name.trim(),
        email: formData.email.trim()
      });
      setProfile(data);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return <p className="text-slate-600">Profile unavailable.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your account information</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            <PencilIcon className="h-4 w-4" />
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-2xl font-bold text-white shadow-md">
              {initials(profile.name)}
            </div>
            <div className="flex-1 pt-1">
              <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
              <p className="mt-1 text-sm text-slate-600">{profile.email}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                {profile.role}
              </div>
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-5 px-6 py-5">
            <div>
              <label className="block text-sm font-semibold text-slate-900">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="your.email@example.com"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
              >
                <CheckIcon className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <XMarkIcon className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <InfoField icon={UserCircleIcon} label="Full Name" value={profile.name} />
            <InfoField icon={EnvelopeIcon} label="Email Address" value={profile.email} />
            <InfoField icon={ShieldCheckIcon} label="Role" value={profile.role} />
            <InfoField icon={BuildingOffice2Icon} label="Organization" value={profile.organizationName} />
          </div>
        )}
      </div>
    </div>
  );
}
