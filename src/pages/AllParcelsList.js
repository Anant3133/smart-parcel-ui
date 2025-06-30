import React, { useEffect, useState } from 'react';
import { fetchQRCode } from '../api/parcel';
import { fetchParcels } from '../api/handover';
import QRCodeModal from '../components/QRCodeModal';
import { useNavigate } from 'react-router-dom';
import { FiTruck, FiUser, FiClipboard, FiPieChart } from 'react-icons/fi';
import { Pie } from 'react-chartjs-2';
import { FiArrowLeftCircle } from 'react-icons/fi';
import { getTokenPayload } from '../utils/token';  


import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AllParcelsList() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
      id: '',
      email: '',
      name: '',
      role: '',
      joinedOn: '',
    });

  useEffect(() => {
    // Decode token and set profile
    const payload = getTokenPayload();
    if (payload) {
      setProfile({
        id: payload.sub || '',
        email: payload.email || '',
        name: payload.name || '',
        role: payload.role || '',
        joinedOn: payload.iat || '',
      });
    }

    // Fetch parcels data
    (async () => {
      try {
        const data = await fetchParcels();
        setParcels(data);
      } catch (err) {
        setError('Failed to load parcels');
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  const openQRCodeModal = async (trackingId) => {
    setShowQrModal(true);
    setQrCode(null);
    try {
      const res = await fetchQRCode(trackingId);
      setQrCode(res.qrCode);
    } catch (err) {
      console.error('Failed to fetch QR Code', err);
    }
  };

  const closeQRCodeModal = () => {
    setShowQrModal(false);
    setQrCode(null);
  };

  const handleReturnToDashboard = () => {
  const role = profile.role?.toLowerCase();

  if (role === 'admin') {
    navigate('/dashboard');
  } else if (role === 'sender') {
    navigate('/dashboard');
  } else if (role === 'handler') {
    navigate('/dashboard');  // Assuming handler dashboard route is /uni
  } else {
    navigate('/');  // fallback login or home page
  }
 };


  const statusCounts = {
    Received: 0,
    Packed: 0,
    Shipped: 0,
    'Out for Delivery': 0,
    Delivered: 0,
  };

  parcels.forEach((p) => {
    const status = p.status ?? p.Status ?? 'Unknown';
    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    }
  });

  const pieData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Parcel Status',
        data: Object.values(statusCounts),
        backgroundColor: ['#8b5cf6', '#eab308', '#38bdf8', '#f97316', '#10b981'],
        borderColor: '#1f2937',
        borderWidth: 2,
      },
    ],
  };

  if (loading) return <div className="text-white p-6">Loading parcels...</div>;
  if (error) return <div className="text-red-600 p-6">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white p-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold flex items-center gap-3 text-purple-400">
          <FiTruck className="text-purple-400" size={40} />
          All Parcels List
        </h1>
        <button
              onClick={handleReturnToDashboard}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded shadow-md transition-transform transform hover:scale-105"
            >
              <FiArrowLeftCircle size={18} />
              Return to Dashboard
            </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          {
            icon: FiClipboard,
            label: 'Total Parcels',
            value: parcels.length,
            color: 'text-purple-400',
            glow: 'rgba(168,85,247,0.6)',
          },
          {
            icon: FiUser,
            label: 'Unique Recipients',
            value: new Set(parcels.map(p => p.recipientName ?? p.RecipientName)).size,
            color: 'text-pink-400',
            glow: 'rgba(244,114,182,0.5)',
          },
          {
            icon: FiPieChart,
            label: 'Delivered',
            value: statusCounts['Delivered'],
            color: 'text-green-400',
            glow: 'rgba(52,211,153,0.5)',
          },
        ].map(({ icon: Icon, label, value, color, glow }) => (
          <div
            key={label}
            className={`bg-gray-800 rounded-lg p-6 shadow-lg flex items-center gap-4
              transition duration-300 ease-in-out hover:scale-[1.02]`}
            style={{ boxShadow: `0 0 8px 2px ${glow}` }}
          >
            <Icon size={40} className={color} />
            <div>
              <h2 className="text-lg font-semibold">{label}</h2>
              <p className="text-3xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-xl mx-auto mb-12 bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
          <FiPieChart /> Parcel Status Breakdown
        </h2>
        <Pie
          data={pieData}
          options={{
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: 'white', font: { size: 14 } },
              },
            },
            maintainAspectRatio: true,
          }}
        />
      </div>

      <div className="overflow-x-auto border border-gray-700 rounded-lg bg-gray-900 p-6 shadow">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              {[
                'Tracking ID',
                'Recipient',
                'Sender Email',
                'Weight',
                'Delivery Location',
                'Status',
                'QR Code',
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {parcels.map((p, idx) => (
              <tr
                key={p.trackingId ?? p.TrackingId}
                className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300 font-medium">
                  {p.trackingId ?? p.TrackingId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {p.recipientName ?? p.RecipientName ?? 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {p.senderEmail ?? p.SenderEmail ?? p.sender?.email ?? 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {p.weight ?? p.Weight ?? 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {p.deliveryAddress ?? p.DeliveryAddress ?? 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {p.status ?? p.Status ?? 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => openQRCodeModal(p.trackingId ?? p.TrackingId)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
                  >
                    Show QR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showQrModal && <QRCodeModal qrCode={qrCode} onClose={closeQRCodeModal} />}
    </div>
  );
}