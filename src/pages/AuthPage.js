import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/auth';
import { saveToken, getTokenPayload } from '../utils/token';
import { motion, AnimatePresence } from 'framer-motion';

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
        if (mode === 'register') alert('Registration successful.');
        const payload = getTokenPayload();
        const userRole = payload?.role?.toLowerCase();
        if (!userRole) {
          alert('Login failed: role missing');
          setLoading(false);
          return;
        }
        navigate('/dashboard');
      } else throw new Error('Auth failed');
    } catch (err) {
      console.error(err);
      alert(
        mode === 'login'
          ? 'Login failed: Invalid credentials'
          : 'Registration failed: User may already exist'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      {/* Left Panel */}
      <div
        className="hidden md:flex flex-col justify-center items-center w-1/2 relative bg-cover bg-center"
        style={{ backgroundImage: "url('/auth-bg.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 to-gray-900/80 z-0" />
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: [ -10, 10, -10 ], opacity: 1 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="z-10 text-center px-8"
        >
          <h1 className="text-5xl font-extrabold text-blue-300 drop-shadow-lg">SmartParcel</h1>
          <p className="mt-3 text-lg text-gray-300">Secure, Seamless & Smart Delivery</p>
        </motion.div>
        <div
         //className="absolute inset-0 bg-repeat opacity-10 animate-[spin_60s_linear_infinite]"
         //style={{ backgroundImage: "url('/parabolic-rectangle.svg')" }}
        />
      </div>

      {/* Right Panel */}
      <div className="flex w-full md:w-1/2 justify-center items-center p-6 md:p-12 bg-pattern-dark bg-clogs bg-repeat"
       style={{ backgroundImage: "url('/Animated-Shape.svg')" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35 }}
            className="relative w-full max-w-md bg-gray-800/70 backdrop-blur-xl rounded-2xl p-8 shadow-2xl"
          >
            <h2 className="text-3xl font-bold text-center text-gray-100 mb-6">
              {mode === 'login' ? 'Login' : 'Register'}
            </h2>

            <div className="space-y-5">
              {/* Email */}
              <label className="flex flex-col text-gray-200 text-sm">
                Email
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  disabled={loading}
                  className="mt-2 p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none shadow-sm hover:shadow-md"
                  autoComplete="username"
                />
              </label>

              {/* Password */}
              <label className="flex flex-col text-gray-200 text-sm relative">
                Password
                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  disabled={loading}
                  className="mt-2 p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none shadow-sm hover:shadow-md pr-12"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                  className="absolute right-4 top-11 text-gray-400 hover:text-gray-200 transition"
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </label>

              {/* Role selector */}
              {mode === 'register' && (
                <label className="flex flex-col text-gray-200 text-sm">
                  Role
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    disabled={loading}
                    className="mt-2 p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none shadow-sm"
                  >
                    <option>Sender</option>
                    <option>Handler</option>
                    <option>Admin</option>
                  </select>
                </label>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-3 font-semibold rounded-lg text-white transition ${
                  loading
                    ? 'bg-blue-400/60 cursor-not-allowed'
                    : mode === 'login'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
              </button>

              {/* Switch mode */}
              <div className="text-center">
                <button
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  disabled={loading}
                  className="text-sm text-blue-300 hover:text-blue-100 transition"
                >
                  {mode === 'login' ? 'New user? Register' : 'Already registered? Login'}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
