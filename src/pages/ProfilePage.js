import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfile, updateProfile } from '../api/profile';
import LogoutButton from '../components/LogoutButton';
import { fetchMyParcels } from '../api/parcel'; // for sender stats
import { FiArrowLeftCircle } from 'react-icons/fi';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    id: '',
    email: '',
    name: '',
    role: '',
    joinedOn: '',
  });
  const [originalName, setOriginalName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parcelsCount, setParcelsCount] = useState(null);
  const [changePassword, setChangePassword] = useState('');

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
          joinedOn: data.createdAt || '', // assuming createdAt is sent
        });
        setOriginalName(data.name || '');

        if ((data.role || '').toLowerCase() === 'sender') {
          const parcels = await fetchMyParcels();
          setParcelsCount(parcels.length);
        }
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
      setOriginalName(profile.name);
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
        navigate('/dashboard');
        break;
      case 'sender':
        navigate('/dashboard');
        break;
      case 'handler':
        navigate('/dashboard');
        break;
      default:
        navigate('/');
        break;
    }
  };

  const getInitials = () => {
    return profile.name
      .split(' ')
      .map((n) => n[0]?.toUpperCase())
      .join('')
      .slice(0, 2);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <p className="text-lg">Loading profile...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white px-6 py-10 flex justify-center">
      <div className="w-full max-w-2xl bg-gray-900 p-8 rounded-xl shadow-md space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">My Profile</h2>
          <LogoutButton />
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-indigo-700 flex items-center justify-center text-2xl font-bold">
            {getInitials()}
          </div>
          <div>
            <p className="text-lg font-semibold">{profile.name || 'Unnamed User'}</p>
            <p className="text-sm text-gray-400">{profile.email}</p>
            <p className="text-xs text-gray-500 mt-1">
              Joined on{' '}
              {profile.joinedOn
                ? new Date(profile.joinedOn).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <div>
            <label className="block mb-1 text-sm font-semibold">Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold">Email</label>
            <input
              type="email"
              value={profile.email}
              readOnly
              className="w-full p-2 rounded bg-gray-700 text-gray-300"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold">Role</label>
            <input
              type="text"
              value={profile.role}
              readOnly
              className="w-full p-2 rounded bg-gray-700 text-gray-300"
            />
          </div>

          {profile.role.toLowerCase() === 'sender' && parcelsCount !== null && (
            <div>
              <label className="block mb-1 text-sm font-semibold">Parcels Sent</label>
              <input
                type="text"
                value={parcelsCount}
                readOnly
                className="w-full p-2 rounded bg-gray-700 text-green-400 font-bold"
              />
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm font-semibold">Change Password (optional)</label>
            <input
              type="password"
              value={changePassword}
              onChange={(e) => setChangePassword(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
              placeholder=""
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving || profile.name === originalName}
            className={`px-4 py-2 rounded font-semibold transition ${
              saving || profile.name === originalName
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

         <button
      onClick={handleReturnToDashboard}
      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded shadow-md transition-transform transform hover:scale-105"
    >
      <FiArrowLeftCircle size={18} />
      Return to Dashboard
    </button>
        </div>
      </div>
    </div>
  );
}