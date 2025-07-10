import React, { useState } from 'react';
import { changePassword } from '../api/password';
import toast from 'react-hot-toast';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (!oldPassword || !newPassword) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword({ OldPassword: oldPassword, NewPassword: newPassword });
      toast.success(res.message || 'Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      onClose();
    } catch (error) {
      // Try to extract error message safely
      const msg = error.response?.data || error.message || 'Failed to change password';
      // If error response is object, convert to string for display
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-white">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Current Password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white"
            autoComplete="current-password"
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white"
            autoComplete="new-password"
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={e => setConfirmNewPassword(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white"
            autoComplete="new-password"
            required
          />
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
