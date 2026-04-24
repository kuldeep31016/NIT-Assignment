import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { loginApi, googleAuthApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import GoogleAuthButton from '../components/GoogleAuthButton';
import AuthHero from '../components/AuthHero';
import BrandMark from '../components/BrandMark';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await loginApi(form);
      login(data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await googleAuthApi({ credential });
      login(data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Google sign-in failed');
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
            <h1 className="mt-6 text-3xl font-bold text-ink-900">Welcome Back !</h1>
            <p className="mt-1.5 text-sm text-ink-500">Please enter your details</p>
          </div>

          <div className="mt-8 space-y-4">
            {error && <ErrorMessage message={error} />}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-800">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-800">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="inline-flex items-center gap-2 text-sm text-ink-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
                onClick={() => setError('Password reset is not yet available — ask an admin to re-invite you.')}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : (
                <>
                  Login <ArrowRightIcon className="h-4 w-4" />
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
            <GoogleAuthButton onCredential={handleGoogle} disabled={loading} text="signin_with" />

            <p className="pt-4 text-center text-sm text-ink-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>

      <AuthHero
        title="Seamless work experience"
        subtitle="Everything you need in an easily customizable dashboard"
        activeDot={0}
      />
    </div>
  );
}
