import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { resetPassword } from '../api/password'; // Assume this API internally verifies the token

export default function ResetPasswordModal({ email, token, onClose }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [enteredToken, setEnteredToken] = useState('');
  const [tokenVerified, setTokenVerified] = useState(false);

  const verifyToken = () => {
    if (enteredToken.trim() === token) {
      toast.success('Token verified');
      setTokenVerified(true);
    } else {
      toast.error('Invalid token');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword({ email, token, newPassword });
      toast.success(res.message || 'Password reset successful');
      onClose();
    } catch {
      toast.error('Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-gray-900 text-white rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>

        {!tokenVerified ? (
          <>
            <input
              type="text"
              placeholder="Enter reset token"
              value={enteredToken}
              onChange={(e) => setEnteredToken(e.target.value)}
              className="w-full p-3 mb-4 rounded bg-gray-800"
            />
            <div className="flex justify-center">
            <button
              onClick={verifyToken}
              className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
            >
              Verify Token
            </button>
            </div>
            <button
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-white hover:underline"
            >
              Cancel
            </button>
          </>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              className="w-full p-3 rounded bg-gray-800"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full p-3 rounded bg-gray-800"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 transition p-2 rounded"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-white hover:underline"
              type="button"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
