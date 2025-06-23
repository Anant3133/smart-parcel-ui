import React, { useEffect, useState, useMemo } from 'react';
import { logHandover } from '../api/handover';
import { getParcelsHandledByHandler } from '../api/parcel';
import { fetchUsers } from '../api/admin';
import DashboardHeader from '../components/DashboardHeader';
import TimelineModal from '../components/TimelineModal';
import { fetchTimeline } from '../api/timeline';
import { fetchParcelStatusLogs } from '../api/status';
import { raiseTamperAlert } from '../api/tamper';
import { Pie } from 'react-chartjs-2';
import toast, { Toaster } from 'react-hot-toast';
import { FiRefreshCcw, FiAlertTriangle, FiClock, FiPackage, FiMapPin } from 'react-icons/fi';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function HandlerDashboard() {
  // Form States
  const [trackingId, setTrackingId] = useState('');
  const [location, setLocation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Data States
  const [result, setResult] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [users, setUsers] = useState([]);

  // Modal & Status States
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [statusStages, setStatusStages] = useState([]);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [currentTrackingId, setCurrentTrackingId] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Constants
  const statusFlow = ['Received', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

  // Map handler userId -> email
  const handlersMap = useMemo(() => {
    const map = {};
    users.forEach((user) => {
      if (user.role?.toLowerCase() === 'handler') {
        map[user.id] = user.email || 'Unknown Handler';
      }
    });
    return map;
  }, [users]);

  // Fetch Parcels
  const fetchParcels = async () => {
    try {
      const data = await getParcelsHandledByHandler();
      setParcels(data);
    } catch (error) {
      console.error('Failed to fetch handled parcels:', error);
      toast.error('Failed to fetch parcels');
    }
  };

  // Fetch Users
  const fetchAllUsers = async () => {
    try {
      const u = await fetchUsers();
      setUsers(u);
    } catch {
      toast.error('Failed to load users');
    }
  };

  // Form submission handler
  const handleLogHandover = async () => {
    if (!trackingId.trim() || !location.trim() || !selectedStatus) {
      toast.error('Please fill all the fields');
      return;
    }

    try {
      const data = await logHandover({
        parcelTrackingId: trackingId.trim(),
        action: selectedStatus,
        location: location.trim(),
      });
      setResult(data);
      toast.success('Handover logged successfully!');
      setTrackingId('');
      setLocation('');
      setSelectedStatus('');
      await fetchParcels();
    } catch (error) {
      console.error('Handover logging failed:', error);
      toast.error('Handover failed. Check Tracking ID and try again.');
    }
  };

  // Show status popup
  const handleShowStatus = async (trackingId) => {
    try {
      const logs = await fetchParcelStatusLogs(trackingId);
      const currentStages = logs.map((log) => log.status);
      setStatusStages(currentStages);
      setCurrentTrackingId(trackingId);
      setShowStatusPopup(true);
    } catch (error) {
      console.error('Error fetching status logs:', error);
      toast.error('Failed to fetch status');
    }
  };

  // Show timeline modal
  const loadTimeline = async (id) => {
    if (!id) return;
    try {
      const data = await fetchTimeline(id);
      setSelectedTimeline(data);
      setShowTimeline(true);
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
      toast.error('Failed to fetch timeline');
    }
  };

  // Raise tamper alert
  const handleTamper = async (trackingId) => {
    try {
      const res = await raiseTamperAlert({
        parcelTrackingId: trackingId,
        note: 'Tamper alert manually raised by handler.'
      });
      toast.success(res.message || 'Tamper alert sent!');
    } catch (error) {
      console.error('Tamper alert failed:', error);
      toast.error('Failed to raise tamper alert');
    }
  };

  // Parcel search + filter
  const filteredParcels = parcels.filter((p) => {
    const term = searchTerm.toLowerCase();
    const status = p.status?.toLowerCase() || '';
    const matchesSearch = p.trackingId?.toLowerCase().includes(term) || p.recipientName?.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Parcel stats for chart
  const statusCounts = statusFlow.reduce((acc, status) => {
    acc[status] = parcels.filter(p => (p.status ?? '').toLowerCase() === status.toLowerCase()).length;
    return acc;
  }, {});

  const chartData = {
    labels: statusFlow,
    datasets: [
      {
        label: 'Parcels',
        data: statusFlow.map(s => statusCounts[s]),
        backgroundColor: [
          '#22c55e', // green
          '#facc15', // yellow
          '#3b82f6', // blue
          '#8b5cf6', // indigo
          '#ef4444', // red
        ],
        borderWidth: 1,
      },
    ],
  };

  useEffect(() => {
    fetchParcels();
    fetchAllUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white p-6 flex flex-col gap-8">
      <Toaster position="top-right" />

      <DashboardHeader title="Handler Dashboard" />

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* --- Left Column: Handover Log Form --- */}
        <section className="bg-gray-850 bg-opacity-60 backdrop-blur-md p-6 rounded-lg shadow-lg flex flex-col gap-4">
          <h3 className="text-2xl font-semibold mb-4">Log Parcel Handover</h3>

          <label className="flex flex-col gap-1 text-gray-300 font-semibold">
            Tracking ID
            <input
              type="text"
              placeholder="Enter Tracking ID"
              value={trackingId}
              onChange={e => setTrackingId(e.target.value)}
              className="p-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="flex flex-col gap-1 text-gray-300 font-semibold">
            Location
            <input
              type="text"
              placeholder="Enter Current Location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="p-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="flex flex-col gap-1 text-gray-300 font-semibold">
            Status
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="p-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Status</option>
              {statusFlow.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>

          <button
            disabled={!trackingId.trim() || !location.trim() || !selectedStatus}
            onClick={handleLogHandover}
            className={`mt-4 py-3 rounded-md font-semibold text-lg transition 
              ${trackingId && location && selectedStatus ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer' : 'bg-gray-700 cursor-not-allowed'}
            `}
          >
            Submit Handover
          </button>

          {result && (
            <div className="mt-4 p-3 rounded-md bg-gray-800 text-green-400">
              <p>{result.message}</p>
              {result.tampered && (
                <p className="text-red-500 font-semibold mt-1">
                  <FiAlertTriangle className="inline mr-1" /> Tampering Detected: {result.tamperNote}
                </p>
              )}
            </div>
          )}
        </section>

        {/* --- Right Column: Parcel Stats + Search + Table --- */}
        <section className="md:col-span-2 flex flex-col gap-6">

          {/* Statistics Panel */}
          <div className="bg-gray-850 bg-opacity-60 backdrop-blur-md rounded-lg shadow-lg p-6 flex flex-col md:flex-row items-center justify-around gap-8">
            <div className="flex flex-col items-center">
              <FiPackage size={48} className="text-indigo-400" />
              <h4 className="mt-2 text-lg font-semibold">Total Parcels</h4>
              <p className="text-3xl font-bold">{parcels.length}</p>
            </div>
            <div className="flex flex-col items-center">
              <FiClock size={48} className="text-yellow-400" />
              <h4 className="mt-2 text-lg font-semibold">In Transit</h4>
              <p className="text-3xl font-bold">
                {parcels.filter(p =>
                  ['shipped', 'out for delivery', 'packed'].includes((p.status ?? '').toLowerCase())
                ).length}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <FiPackage size={48} className="text-green-400" />
              <h4 className="mt-2 text-lg font-semibold">Delivered</h4>
              <p className="text-3xl font-bold">
                {parcels.filter(p => (p.status ?? '').toLowerCase() === 'delivered').length}
              </p>
            </div>
            <div className="max-w-xs w-full">
              <Pie data={chartData} options={{
                plugins: {
                  legend: { position: 'bottom', labels: { color: 'white' } }
                },
                maintainAspectRatio: true,
              }} />
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-850 bg-opacity-60 backdrop-blur-md p-4 rounded-lg shadow-lg">
            <input
              type="text"
              placeholder="Search by Tracking ID or Recipient"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow p-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              {statusFlow.map((status) => (
                <option key={status} value={status.toLowerCase()}>{status}</option>
              ))}
            </select>
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-semibold"
              title="Reset filters"
            >
              Reset
            </button>
          </div>

          {/* Parcels Table */}
          <div className="overflow-x-auto rounded-lg shadow-lg bg-gray-850 bg-opacity-60 backdrop-blur-md p-4">
            <table className="min-w-full text-white border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3 text-left">Tracking ID</th>
                  <th className="p-3 text-left">Recipient</th>
                  <th className="p-3 text-left">Location</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Timeline</th>
                  <th className="p-3 text-center">Tamper Alert</th>
                </tr>
              </thead>
              <tbody>
                {filteredParcels.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-gray-400 italic">
                      No parcels found.
                    </td>
                  </tr>
                ) : (
                  filteredParcels.map((p) => {
                    const tracking = p.ParcelTrackingId || p.trackingId || p.trackingID;
                    const statusLower = (p.status ?? '').toLowerCase();

                    // Status color badge
                    const statusColor = {
                      received: 'bg-gray-600',
                      packed: 'bg-yellow-600',
                      shipped: 'bg-blue-600',
                      'out for delivery': 'bg-indigo-600',
                      delivered: 'bg-green-600',
                    }[statusLower] || 'bg-gray-600';

                    return (
                      <tr key={tracking} className="hover:bg-gray-800 transition">
                        <td className="p-3">{tracking}</td>
                        <td className="p-3">{p.recipientName || 'N/A'}</td>
                        <td className="p-3">{p.currentLocation || 'N/A'}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                            {p.status || 'Unknown'}
                          </span>
                          <button
                            className="ml-2 bg-blue-700 hover:bg-blue-800 text-white px-2 py-1 rounded text-xs"
                            onClick={() => handleShowStatus(tracking)}
                            title="View Status Progress"
                          >
                            Show Status
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            className="text-indigo-400 underline text-sm"
                            onClick={() => loadTimeline(tracking)}
                            title="View Timeline"
                          >
                            View Timeline
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                            onClick={() => handleTamper(tracking)}
                            title="Raise Tamper Alert"
                          >
                            Raise Alert
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Status Modal */}
      {showStatusPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-xl max-w-3xl w-full">
            <h2 className="text-2xl font-bold mb-6 text-white">Status Progress for {currentTrackingId}</h2>
            <div className="flex justify-between items-center space-x-4">
              {statusFlow.map((status, index) => {
                const currentIndex = Math.max(
                  ...statusStages.map((s) => statusFlow.indexOf(s)).filter(i => i !== -1)
                );
                const isCompleted = index <= currentIndex;
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center font-semibold text-lg ${
                        isCompleted ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <p className="mt-2 text-white text-center text-sm font-semibold">{status}</p>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setShowStatusPopup(false)}
              className="mt-8 w-full py-3 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {showTimeline && selectedTimeline && (
        <TimelineModal
          timeline={selectedTimeline}
          onClose={() => setShowTimeline(false)}
          handlersMap={handlersMap}
        />
      )}
    </div>
  );
}