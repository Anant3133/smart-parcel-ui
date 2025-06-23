import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfile, updateProfile } from '../api/profile';
import LogoutButton from '../components/LogoutButton';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    id: '',
    email: '',
    name: '',
    role: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProfile();
        setProfile({
          id: data.id,
          email: data.email,
          name: data.name || '',
          role: data.role,
        });
      } catch {
        alert('Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(profile);
      alert('Profile updated successfully');
    } catch {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleReturnToDashboard = () => {
    switch (profile.role.toLowerCase()) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'sender':
        navigate('/sender-dashboard');
        break;
      case 'handler':
        navigate('/handler-dashboard');
        break;
      default:
        navigate('/');
        break;
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Profile</h2>
        <LogoutButton />
      </div>

      <label className="block">
        Email (read-only)
        <input
          type="email"
          name="email"
          value={profile.email}
          readOnly
          className="border p-2 w-full bg-gray-100"
        />
      </label>

      <label className="block">
        Name
        <input
          type="text"
          name="name"
          value={profile.name}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </label>

      <label className="block">
        Role (read-only)
        <input
          type="text"
          name="role"
          value={profile.role}
          readOnly
          className="border p-2 w-full bg-gray-100"
        />
      </label>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

      <button
        onClick={handleReturnToDashboard}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        Return to Dashboard
      </button>
    </div>
  );
}