import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { forgotPassword } from '../api/password'; // Make sure this path is correct

export default function ForgotPasswordModal({ onClose, onTokenGenerated }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!email.trim()) {
    toast.error('Email is required');
    return;
  }

  setLoading(true);
  try {
    const response = await forgotPassword(email);
    console.log('Reset token (for testing):', response.token); // ✅ Log token
    toast.success(response.message || 'Reset token sent');
    onTokenGenerated({ email, token: response.token });
    onClose();
  } catch (err) {
    toast.error('Failed to send reset token');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-gray-900 text-white rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <div className="flex justify-center"> 
          <button
            type="submit"
            disabled={loading}
            className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-3 text-center me-2 mb-2"
          >
            {loading ? 'Sending...' : 'Send Reset Token'}
          </button>
          </div>
        </form>
        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-400 hover:text-white hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
