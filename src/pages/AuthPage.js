import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/auth';
import { saveToken, getTokenPayload } from '../utils/token';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Sender');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const token =
        mode === 'login'
          ? await login({ email, password })
          : await register({ email, password, role });

      if (token) {
        console.log("Received token:", token);
        saveToken(token);

        if (mode === 'register') {
          alert('Registration successful. You are now logged in.');
        }

        const payload = getTokenPayload(); // ✅ use normalized payload
        console.log("Decoded JWT payload:", payload);

        const userRole = payload?.role?.toLowerCase();
        if (!userRole) {
          alert("Login failed: role missing in token");
          return;
        }

        navigate(`/${userRole}-dashboard`);
      } else {
        throw new Error('Auth failed');
      }
    } catch (err) {
      console.error("Auth error:", err);
      alert(mode === 'login' ? 'Login failed: Invalid credentials' : 'Registration failed: User may already exist');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">{mode === 'login' ? 'Login' : 'Register'}</h1>
      
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        className="border p-2"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        className="border p-2"
      />
      
      {mode === 'register' && (
        <select value={role} onChange={e => setRole(e.target.value)} className="border p-2">
          <option value="Sender">Sender</option>
          <option value="Handler">Handler</option>
          <option value="Admin">Admin</option>
        </select>
      )}
      
      <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">
        {mode === 'login' ? 'Login' : 'Register'}
      </button>
      
      <button
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        className="text-sm underline text-blue-600"
      >
        {mode === 'login' ? 'New user? Register' : 'Already registered? Login'}
      </button>
    </div>
  );
}
