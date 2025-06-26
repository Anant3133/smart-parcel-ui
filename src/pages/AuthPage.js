import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/auth';
import { saveToken, getTokenPayload } from '../utils/token';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Sender');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      alert('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const token =
        mode === 'login'
          ? await login({ email, password })
          : await register({ email, password, role });

      if (token) {
        saveToken(token);

        if (mode === 'register') {
          alert('Registration successful. You are now logged in.');
        }

        const payload = getTokenPayload();
        const userRole = payload?.role?.toLowerCase();
        if (!userRole) {
          alert('Login failed: role missing in token');
          setLoading(false);
          return;
        }

        navigate(`/dashboard`);
      } else {
        throw new Error('Auth failed');
      }
    } catch (err) {
      console.error('Auth error:', err);
      alert(mode === 'login' ? 'Login failed: Invalid credentials' : 'Registration failed: User may already exist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: 'url(/auth-bg.png)' }}
    >
      <div className="bg-black bg-opacity-80 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-md text-white flex flex-col gap-6">
        <h1 className="text-4xl font-extrabold text-center tracking-wide select-none flex items-center justify-center gap-3">
          {mode === 'login' ? 'Login' : 'Register'}
          <span
            className={`inline-block w-10 h-10 rounded-full ${
              mode === 'login' ? 'bg-blue-600' : 'bg-green-600'
            } animate-pulse`}
            aria-hidden="true"
          />
        </h1>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col text-sm font-semibold text-gray-300">
            Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 rounded-md bg-gray-800 border border-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              autoComplete="username"
              disabled={loading}
            />
          </label>

          <label className="flex flex-col text-sm font-semibold text-gray-300 relative">
            Password
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="********"
              className="mt-1 rounded-md bg-gray-800 border border-gray-700 p-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-gray-400 hover:text-gray-200 transition"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19.5c-5.523 0-10-4.477-10-10 0-1.108.218-2.17.615-3.15m3.225-2.587A9.956 9.956 0 0112 4.5c5.523 0 10 4.477 10 10a9.98 9.98 0 01-1.392 5.122M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </label>

          {mode === 'register' && (
            <label className="flex flex-col text-sm font-semibold text-gray-300">
              Role
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="mt-1 rounded-md bg-gray-800 border border-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                disabled={loading}
              >
                <option value="Sender">Sender</option>
                <option value="Handler">Handler</option>
                <option value="Admin">Admin</option>
              </select>
            </label>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`mt-4 w-full py-3 font-semibold rounded-lg text-white transition ${
              loading
                ? 'bg-blue-700 cursor-not-allowed'
                : mode === 'login'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </button>

          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            disabled={loading}
            className="mt-2 text-sm underline text-blue-300 hover:text-blue-100 transition"
          >
            {mode === 'login' ? 'New user? Register' : 'Already registered? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
