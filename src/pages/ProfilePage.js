import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchProfile,
  updateProfile,
  uploadProfilePicture,
  uploadBannerImage,
} from '../api/profile';
import { fetchMyParcels, getParcelsHandledByHandler } from '../api/parcel';
import { fetchUsers, fetchParcels, fetchAlerts } from '../api/admin';
import LogoutButton from '../components/LogoutButton';
import { FiArrowLeftCircle, FiCamera, FiUser, FiCalendar, FiPhone, FiMapPin, FiGlobe, FiInfo } from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState(false);

  const fieldMeta = {
    name: { label: 'Full Name', icon: <FiUser /> },
    birthday: { label: 'Birthday', icon: <FiCalendar /> },
    mobile: { label: 'Mobile', icon: <FiPhone /> },
    location: { label: 'Location', icon: <FiMapPin /> },
    languages: { label: 'Languages', icon: <FiGlobe /> },
    about: { label: 'About', icon: <FiInfo /> },
  };

  useEffect(() => {
  (async () => {
    try {
      const p = await fetchProfile();
      setProfile(p);
      setForm({
        name: p.name,
        birthday: p.birthday?.slice(0, 10),
        mobile: p.mobile,
        location: p.location,
        languages: p.languages,
        about: p.about,
      });

      const role = (p.role || '').toLowerCase();
      let s = {}, acts = [];

      if (role === 'sender') {
        const parcels = await fetchMyParcels();
        const delivered = parcels.filter(x => (x.status || '').toLowerCase() === 'delivered').length;
        const transit = parcels.length - delivered;
        s = { total: parcels.length, delivered, inTransit: transit };
        acts = parcels.slice(-5).map(x => `Sent parcel ${x.trackingId}`);
         setStats(s);
      }


      if (role === 'handler') {
        const handled = await getParcelsHandledByHandler();

        const statusCounts = {
          Received: 0,
          Packed: 0,
          Shipped: 0,
          'Out for Delivery': 0,
          Delivered: 0,
        };

        handled.forEach(p => {
          const status = (p.status || '').trim();
          if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
          }
        });

        const latest = handled.reduce((latest, curr) => {
          return new Date(curr.handoverTime) > new Date(latest.handoverTime)
            ? curr
            : latest;
        }, handled[0]);

        setStats({
          total: handled.length,
          delivered: statusCounts.Delivered,
          inTransit: handled.length - statusCounts.Delivered,
          latestHandover: latest?.handoverTime?.slice(0, 10) || 'N/A',
          statusBreakdown: statusCounts,
        });

        acts = handled.slice(-5).map(x => `Handled parcel ${x.trackingId}`);
      }

      if (role === 'admin') {
        const us = await fetchUsers();
        const pr = await fetchParcels();
        const al = await fetchAlerts();
        s = {
          users: us.length,
          handlers: us.filter(u => u.role === 'Handler').length,
          parcels: pr.length,
          alerts: al.length,
        };
        acts = al.slice(-5).map(a => `Alert ${a.id}`);
        setStats(s);
      }

      setActivities(acts.reverse());
    } catch (e) {
      console.error(e);
      alert('Failed to load profile or stats');
    } finally {
      setLoading(false);
    }
  })();
}, []);


  if (loading)
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const hasChanges = () => {
    return ['name', 'birthday', 'mobile', 'location', 'languages', 'about'].some(f => {
      if (f === 'birthday') {
        return form[f] !== (profile[f] ?? '').slice(0, 10);
      }
      return form[f] !== (profile[f] ?? '');
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ ...profile, ...form });
      setProfile({ ...profile, ...form });
      setEdit(false);
      toast.success('Profile changes saved!');
    } catch {
      toast.error('Failed to save changes!');
    } finally {
      setSaving(false);
    }
  };

  const uploadPic = async e => {
    const url = await uploadProfilePicture(e.target.files[0]);
    setProfile(p => ({ ...p, profilePicUrl: url }));
  };

  const uploadBanner = async e => {
    const url = await uploadBannerImage(e.target.files[0]);
    setProfile(p => ({ ...p, bannerUrl: url }));
  };

  const role = (profile.role || '').toLowerCase();

  const chartData =
  role === 'sender'
    ? {
        labels: ['Delivered', 'In Transit'],
        datasets: [
          {
            data: [stats.delivered || 0, stats.inTransit || 0],
            backgroundColor: ['#34D399', '#FBBF24'], // Green, Yellow
          },
        ],
      }
    : role === 'handler'
    ? {
        labels: Object.keys(stats.statusBreakdown || {}),
        datasets: [
          {
            data: Object.values(stats.statusBreakdown || {}),
            backgroundColor: [
              '#6366F1', // Received
              '#F59E0B', // Packed
              '#3B82F6', // Shipped
              '#A855F7', // Out for Delivery
              '#10B981', // Delivered
            ],
          },
        ],
      }
    : role === 'admin'
    ? {
        labels: ['Users', 'Handlers', 'Parcels', 'Alerts'],
        datasets: [
          {
            data: [
              stats.users || 0,
              stats.handlers || 0,
              stats.parcels || 0,
              stats.alerts || 0,
            ],
            backgroundColor: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'],
          },
        ],
      }
    : null;



      console.log('Profile role:', profile.role);
      console.log('Stats:', stats);
      console.log('Chart data:', chartData);


  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Toaster position="top-center" reverseOrder={false} />

     <div className="relative bg-gray-900 text-white">

  {/* Banner */}
  <div className="relative w-full h-48">
    <img
      src={profile.bannerUrl || '/profilebanner.png'}
      alt="Banner"
      className="w-full h-full object-cover"
    />

    <label className="absolute top-4 left-4 bg-gray-800 p-2 rounded-full hover:bg-gray-700 cursor-pointer">
      <FiCamera />
      <input type="file" hidden onChange={uploadBanner} />
    </label>
    
    {/* Buttons: Back and Logout, top right over banner */}
    <div className="absolute top-4 right-4 flex space-x-4">
      <button 
        onClick={() => navigate('/dashboard')}
        type="button" 
        className="text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800 flex items-center gap-2 transition-colors duration-300">
         <FiArrowLeftCircle className="mr-1" /> Back
      </button>
      <LogoutButton />
    </div>
  </div>

  {/* Avatar and Name/Role container */}
  <div className="relative flex flex-col items-center -mt-12 mb-6">
    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-600 relative">
      <img
        src={profile.profilePicUrl || '/profilepic.jpg'}
        alt="Avatar"
        className="w-full h-full object-cover"
      />
      <label className="absolute bottom-0 right-0 bg-gray-800 p-1 rounded-full hover:bg-gray-700 cursor-pointer">
        <FiCamera />
        <input type="file" hidden onChange={uploadPic} />
      </label>
    </div>
    <h1 className="text-xl font-semibold mt-3">{form.name || '—'}</h1>
    <p className="text-gray-400">{profile.role || '—'}</p>
  </div>

</div>



      {/* Main */}
      <div className="min-h-[calc(100vh-6rem)] w-full px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-5 col-span-1">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">Profile Info</h2>
            <button
              onClick={() => setEdit(!edit)}
              className="text-sm bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
            >
              {edit ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <AnimatePresence>
            {Object.keys(fieldMeta).map(f => (
              <motion.div
                key={f}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-4"
              >
                <label className="block text-sm mb-1 text-gray-400 flex items-center gap-2">
                  {fieldMeta[f].icon} {fieldMeta[f].label}
                </label>
                {edit ? (
                  f === 'about' ? (
                    <textarea
                      name={f}
                      value={form[f] ?? ''}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-700 text-white rounded-lg resize-none"
                      rows={3}
                    />
                  ) : (
                    <input
                      type={f === 'birthday' ? 'date' : 'text'}
                      name={f}
                      value={form[f] ?? ''}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-700 text-white rounded-lg"
                    />
                  )
                ) : (
                  <p className="text-white bg-gray-700 p-3 rounded">{form[f] || '—'}</p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {edit && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={!hasChanges() || saving}
              onClick={handleSave}
              className="w-full bg-indigo-600 py-3 rounded-lg text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </motion.button>
          )}
        </div>

{/* Stats + Chart */}
<div className="col-span-2 space-y-6">
  {/* Stat Cards */}
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
    {profile.role?.toLowerCase() === 'sender' && (
      <>
        <StatCard title="Total Parcels" value={stats.total ?? 0} />
        <StatCard title="Delivered" value={stats.delivered ?? 0} />
        <StatCard title="In Transit" value={stats.inTransit ?? 0} />
      </>
    )}

    {profile.role?.toLowerCase() === 'handler' && (
      <>
        <StatCard title="Total Handled" value={stats.total ?? 0} />
        <StatCard title="Delivered" value={stats.delivered ?? 0} />
        <StatCard title="In Transit" value={stats.inTransit ?? 0} />
        <StatCard title="Latest Handover" value={stats.latestHandover ?? 'N/A'} />
      </>
    )}

    {profile.role?.toLowerCase() === 'admin' && (
      <>
        <StatCard title="Users" value={stats.users ?? 0} />
        <StatCard title="Handlers" value={stats.handlers ?? 0} />
        <StatCard title="Parcels" value={stats.parcels ?? 0} />
        <StatCard title="Alerts" value={stats.alerts ?? 0} />
      </>
    )}
  </div>

  {/* Bar Chart */}
  {chartData && (
    <div
      className="bg-gray-800 p-6 rounded-xl shadow-lg relative"
      style={{ minHeight: 260 }}
    >
      <h3 className="text-lg font-semibold text-white mb-4">
        Parcel Status Overview
      </h3>
      <div className="h-80 w-full">
        <Bar
          data={chartData}
          options={{
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: 'white' } }
            },
            scales: {
              x: { ticks: { color: 'white' }, grid: { color: '#444' } },
              y: { ticks: { color: 'white' }, grid: { color: '#444' } }
            }
          }}
        />
      </div>
    </div>
  )}
</div>


          {/* Activity Log */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg col-span-full">
            <h2 className="text-2xl font-semibold text-white mb-3">Recent Activity</h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-300">
              {activities.length > 0
                ? activities.map((a, i) => <li key={i}>{a}</li>)
                : <li>No recent activity.</li>}
            </ul>
          </div>
        </div>
      </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div
      className="
        bg-gray-800 p-4 rounded-xl text-center shadow-lg
        transition duration-300 transform
        hover:scale-105 hover:ring-2 hover:ring-green-400
        hover:shadow-[0_0_20px_#22c55e]
      "
    >
      <div className="text-3xl font-bold text-green-400">{value ?? '-'}</div>
      <div className="text-sm text-gray-300 mt-1">{title}</div>
    </div>
  );
}
