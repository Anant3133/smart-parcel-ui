import React, { useEffect, useState } from 'react';
import { createParcel, fetchMyParcels } from '../api/parcel';
import { fetchParcelStatusLogs } from '../api/status';
import DashboardHeader from '../components/DashboardHeader';
import TimelineModal from '../components/TimelineModal';
import { fetchTimeline } from '../api/timeline';

import { FiPackage, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function SenderDashboard() {
  const [recipientName, setRecipientName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [result, setResult] = useState(null);
  const [myParcels, setMyParcels] = useState([]);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [statusStages, setStatusStages] = useState([]);
  const [currentTrackingId, setCurrentTrackingId] = useState('');
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [loadingParcels, setLoadingParcels] = useState(false);
  const [creatingParcel, setCreatingParcel] = useState(false);
  const [senderAddress, setSenderAddress] = useState('');
  const [parcelCategory, setParcelCategory] = useState('');
  const [weight, setWeight] = useState('');


  const statusList = ['Received', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

  const handleCreate = async () => {
    if (!recipientName.trim() || !deliveryAddress.trim()) {
      toast.error('Please enter both Recipient Name and Delivery Address');
      return;
    }
    setCreatingParcel(true);
    try {
      const data = await createParcel({
        recipientName: recipientName.trim(),
        deliveryAddress: deliveryAddress.trim(),
        senderAddress: senderAddress.trim(),
        parcelCategory,
        weight: parseFloat(weight),
      });
      setResult(data);
      toast.success('Parcel created successfully!');
      fetchParcels();
      setRecipientName('');
      setDeliveryAddress('');
    } catch (error) {
      console.error('Failed to create parcel:', error);
      toast.error('Failed to create parcel');
    } finally {
      setCreatingParcel(false);
    }
  };

  const fetchParcels = async () => {
    setLoadingParcels(true);
    try {
      const data = await fetchMyParcels();
      setMyParcels(data);
    } catch (error) {
      console.error('Failed to load your parcels:', error);
      toast.error('Failed to load your parcels');
    } finally {
      setLoadingParcels(false);
    }
  };

  const handleShowStatus = async (trackingId) => {
  try {
    const logs = await fetchParcelStatusLogs(trackingId);
    if (logs.length === 0) {
      // No logs yet, set default status as Received
      setStatusStages(['Received']);
    } else {
      setStatusStages(logs.map((log) => log.status));
    }
    setCurrentTrackingId(trackingId);
    setShowStatusPopup(true);
  } catch (error) {
    // If 404 or no logs, fallback to Received status instead of error
    if (error.response && error.response.status === 404) {
      setStatusStages(['Received']);
      setCurrentTrackingId(trackingId);
      setShowStatusPopup(true);
    } else {
      console.error('Status fetch error:', error);
      toast.error('Could not fetch status.');
    }
  }
};



  const handleShowTimeline = async (trackingId) => {
    try {
      const data = await fetchTimeline(trackingId);
      setSelectedTimeline(data);
      setShowTimeline(true);
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
      toast.error('Failed to fetch timeline');
    }
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  // Prepare chart data for parcel statuses
  const deliveredCount = myParcels.filter(p => (p.status ?? '').toLowerCase() === 'delivered').length;
  const inTransitCount = myParcels.filter(p =>
    ['packed', 'shipped', 'out for delivery'].includes((p.status ?? '').toLowerCase())
  ).length;
  const pendingCount = myParcels.length - deliveredCount - inTransitCount;

  const chartData = {
    labels: ['Delivered', 'In Transit', 'Pending'],
    datasets: [
      {
        label: 'Parcels',
        data: [deliveredCount, inTransitCount, pendingCount],
        backgroundColor: ['#34D399', '#FBBF24', '#6B7280'], // green, yellow, gray
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, color: '#D1D5DB' } },
      x: { ticks: { color: '#D1D5DB' } },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-300 p-8 font-sans">
      <ToastContainer position="top-right" autoClose={3500} theme="dark" />

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-extrabold text-white flex items-center space-x-3">
          <FiPackage size={36} className="text-green-400" />
          <span>Sender Dashboard</span>
        </h2>
        <DashboardHeader title="" />
      </div>

      {/* Summary Cards and Chart */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg flex items-center space-x-4 hover:shadow-green-500/50 transition-shadow">
          <FiPackage size={36} className="text-green-400" />
          <div>
            <p className="text-sm uppercase tracking-wide text-green-300 font-semibold">Total Parcels</p>
            <p className="text-3xl font-bold text-white">{myParcels.length}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg flex items-center space-x-4 hover:shadow-blue-400/60 transition-shadow">
          <FiCheckCircle size={36} className="text-green-400" />
          <div>
            <p className="text-sm uppercase tracking-wide text-green-300 font-semibold">Delivered</p>
            <p className="text-3xl font-bold text-green-400">{deliveredCount}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg flex items-center space-x-4 hover:shadow-yellow-400/70 transition-shadow">
          <FiClock size={36} className="text-yellow-400" />
          <div>
            <p className="text-sm uppercase tracking-wide text-yellow-300 font-semibold">In Transit</p>
            <p className="text-3xl font-bold text-yellow-400">{inTransitCount}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <Bar data={chartData} options={chartOptions} height={130} />
        </div>
      </div>

      {/* Create Parcel Form */}
<div className="max-w-3xl mx-auto bg-gray-900 rounded-xl shadow-xl p-8 mb-12 border border-gray-700">
  <h3 className="text-2xl font-semibold mb-6 text-white">Create Parcel</h3>
  <div className="space-y-5">
    <input
      type="text"
      placeholder="Recipient Name"
      className="w-full rounded-lg bg-gray-800 border border-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
      value={recipientName}
      onChange={(e) => setRecipientName(e.target.value)}
      disabled={creatingParcel}
    />
    <input
      type="text"
      placeholder="Delivery Address"
      className="w-full rounded-lg bg-gray-800 border border-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
      value={deliveryAddress}
      onChange={(e) => setDeliveryAddress(e.target.value)}
      disabled={creatingParcel}
    />

    {/* New Fields Start */}
    <input
      type="text"
      placeholder="Sender Address"
      className="w-full rounded-lg bg-gray-800 border border-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
      value={senderAddress}
      onChange={(e) => setSenderAddress(e.target.value)}
      disabled={creatingParcel}
    />

    <select
      value={parcelCategory}
      onChange={(e) => setParcelCategory(e.target.value)}
      className="w-full rounded-lg bg-gray-800 border border-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
      disabled={creatingParcel}
    >
      <option value="">Select Parcel Category</option>
      <option value="Fragile">Fragile</option>
      <option value="Heavy">Heavy</option>
      <option value="Standard">Standard</option>
    </select>

    <input
      type="number"
      step="0.01"
      placeholder="Weight (kg)"
      className="w-full rounded-lg bg-gray-800 border border-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
      value={weight}
      onChange={(e) => setWeight(e.target.value)}
      disabled={creatingParcel}
    />
    {/* New Fields End */}

    <button
      onClick={handleCreate}
      disabled={creatingParcel}
      className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-3 rounded-lg shadow-md transition flex justify-center items-center space-x-2 disabled:opacity-50"
    >
      {creatingParcel ? (
        <svg
          className="animate-spin h-6 w-6 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      ) : null}
      <span>Create Parcel</span>
    </button>
    {result && (
      <div className="mt-6 bg-gray-800 rounded-lg p-5 border border-green-500 shadow-md flex items-center space-x-6">
        <div>
          <p className="text-lg font-semibold text-green-400">Tracking ID:</p>
          <p className="text-xl font-bold text-white">{result.trackingId}</p>
        </div>
        <img src={result.qrCode} alt="QR Code" className="w-32 h-32 rounded-md shadow-lg" />
      </div>
    )}
  </div>
</div>


      {/* Parcels Table */}
<div className="max-w-7xl mx-auto bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 overflow-x-auto">
  <h3 className="text-2xl font-bold mb-5 text-white flex items-center space-x-2">
    <FiPackage className="text-green-400" />
    <span>My Parcels</span>
  </h3>
  {loadingParcels ? (
    <div className="flex justify-center py-20">
      <svg
        className="animate-spin h-12 w-12 text-green-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
    </div>
  ) : (
    <table className="min-w-full border border-gray-700 text-sm text-gray-300 rounded-lg overflow-hidden">
      <thead>
        <tr className="bg-gray-800 text-gray-200 uppercase text-xs select-none">
          <th className="p-3 border border-gray-700">Tracking ID</th>
          <th className="p-3 border border-gray-700">Recipient</th>
          <th className="p-3 border border-gray-700">Delivery Address</th>
          <th className="p-3 border border-gray-700">Sender Address</th>
          <th className="p-3 border border-gray-700">Weight (kg)</th>
          <th className="p-3 border border-gray-700">Parcel Type</th>
          <th className="p-3 border border-gray-700">Status</th>
          <th className="p-3 border border-gray-700">Timeline</th>
        </tr>
      </thead>
      <tbody>
        {myParcels.map((p) => (
          <tr
            key={p.trackingId}
            className="hover:bg-gray-800 cursor-pointer transition-colors"
            title="Click buttons to view status or timeline"
          >
            <td className="p-3 border border-gray-700 font-mono text-xs">{p.trackingId}</td>
            <td className="p-3 border border-gray-700">{p.recipientName}</td>
            <td className="p-3 border border-gray-700">{p.deliveryAddress}</td>
            <td className="p-3 border border-gray-700">{p.senderAddress}</td>
            <td className="p-3 border border-gray-700">{p.weight}</td>
            <td className="p-3 border border-gray-700">{p.parcelCategory}</td>
            <td className="p-3 border border-gray-700">
              <button
                onClick={() => handleShowStatus(p.trackingId)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center justify-center space-x-1 transition"
              >
                <FiAlertCircle size={18} />
                <span>Show Status</span>
              </button>
            </td>
            <td className="p-3 border border-gray-700 flex items-center justify-center">
              <button
                onClick={() => handleShowTimeline(p.trackingId)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded flex items-center justify-center space-x-1 transition"
              >
                <FiClock size={18} />
                <span>View Timeline</span>
              </button>
            </td>
          </tr>
        ))}
        {myParcels.length === 0 && (
          <tr>
            <td colSpan={8} className="text-center p-6 text-gray-500 italic">
              No parcels found. Create one above!
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )}
</div>

{showStatusPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div className="bg-gray-900 p-6 rounded-xl text-white w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Status Progress for {currentTrackingId}</h2>
      <div className="flex justify-between items-center space-x-2">
        {(() => {
          const highestStageIndex = Math.max(
            ...statusStages.map((s) => statusList.indexOf(s)).filter(i => i >= 0),
            -1
          );
          return statusList.map((status, index) => {
            const isCompleted = index <= highestStageIndex;
            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                <p className="text-xs mt-1 text-center">{status}</p>
              </div>
            );
          });
        })()}
      </div>
      <button
        onClick={() => setShowStatusPopup(false)}
        className="mt-6 bg-red-600 text-white px-4 py-2 rounded"
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
        />
      )}
    </div>
  );
}
