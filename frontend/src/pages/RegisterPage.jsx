import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { registerApi, googleAuthApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import GoogleAuthButton from '../components/GoogleAuthButton';
import AuthHero from '../components/AuthHero';
import BrandMark from '../components/BrandMark';

function Field({ label, name, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink-800">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
      />
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({ orgName: '', orgSlug: '', name: '', email: '', password: '' });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      const { data } = await registerApi(form);
      login(data.token);
      navigate('/dashboard');
    } catch (error) {
      const responseError = error.response?.data?.error;
      setErrors(Array.isArray(responseError) ? responseError : [responseError || 'Registration failed']);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential) => {
    setLoading(true);
    setErrors([]);
    try {
      const { data } = await googleAuthApi({
        credential,
        orgName: form.orgName || undefined,
        orgSlug: form.orgSlug || undefined
      });
      login(data.token);
      navigate('/dashboard');
    } catch (err) {
      const responseError = err.response?.data?.error;
      setErrors(Array.isArray(responseError) ? responseError : [responseError || 'Google sign-up failed']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <form onSubmit={submit} className="w-full max-w-md">
          <div className="flex flex-col items-center text-center">
            <BrandMark className="h-12 w-12" />
            <h1 className="mt-6 text-3xl font-bold text-ink-900">Create Account</h1>
            <p className="mt-1.5 text-sm text-ink-500">Spin up your workspace in seconds</p>
          </div>

          <div className="mt-8 space-y-4">
            {errors.map((error) => <ErrorMessage key={error} message={error} />)}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Organization" name="orgName" value={form.orgName} onChange={onChange} placeholder="Acme Inc." required />
              <Field label="Slug" name="orgSlug" value={form.orgSlug} onChange={onChange} placeholder="acme" required />
            </div>

            <Field label="Your Name" name="name" value={form.name} onChange={onChange} placeholder="Ada Lovelace" required />
            <Field label="Email Address" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@company.com" required />
            <Field label="Password" name="password" type="password" value={form.password} onChange={onChange} placeholder="At least 8 characters" required />

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? 'Creating account...' : (
                <>
                  Create Account <ArrowRightIcon className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="pt-1 text-xs text-ink-500">
              By creating an account, you agree to our{' '}
              <a href="#" className="font-medium text-brand-600 hover:underline">Terms of Service</a>{' '}and{' '}
              <a href="#" className="font-medium text-brand-600 hover:underline">Privacy Policy</a>.
            </p>

            <div className="flex items-center gap-3 pt-2 text-[11px] font-medium uppercase tracking-widest text-ink-400">
              <span className="h-px flex-1 bg-ink-200" />
              Or continue with
              <span className="h-px flex-1 bg-ink-200" />
            </div>
            <GoogleAuthButton onCredential={handleGoogle} disabled={loading} text="signup_with" />

            <p className="pt-4 text-center text-sm text-ink-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>

      <AuthHero
        title="Built for focused teams"
        subtitle="Invite your team, assign tasks, track progress — all in one place"
        activeDot={1}
      />
    </div>
  );
}
