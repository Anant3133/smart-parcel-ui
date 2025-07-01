import React, { useEffect, useState } from 'react';
import { fetchParcels } from '../api/admin';
import { fetchQRCode } from '../api/parcel';
import QRCodeModal from '../components/QRCodeModal';
import { FiTruck, FiUser, FiClipboard, FiPieChart } from 'react-icons/fi';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminParcels() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
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
    setQrCode(null); // reset for new load
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

  if (loading) return <div className="text-white p-6">Loading parcels...</div>;
  if (error) return <div className="text-red-600 p-6">{error}</div>;

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
        label: 'Parcel Status Distribution',
        data: Object.values(statusCounts),
        backgroundColor: ['#3b82f6', '#facc15', '#a78bfa', '#f97316', '#22c55e'],
        borderColor: '#1f2937',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black p-8 text-white font-sans">
      <h1 className="text-4xl font-extrabold mb-8 flex items-center gap-3">
        <FiTruck className="text-green-500" size={40} />
        Parcel Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Wrap the mapped JSX in a React fragment */}
        <>
          {[
            {
              icon: FiClipboard,
              label: 'Total Parcels',
              value: parcels.length,
              color: 'text-indigo-400',
              glow: 'rgba(99,102,241,0.7)',
            },
            {
              icon: FiUser,
              label: 'Unique Recipients',
              value: new Set(parcels.map(p => p.recipientName ?? p.RecipientName)).size,
              color: 'text-rose-400',
              glow: 'rgba(244,63,94,0.6)',
            },
            {
              icon: FiPieChart,
              label: 'Delivered Parcels',
              value: statusCounts['Delivered'],
              color: 'text-emerald-400',
              glow: 'rgba(52,211,153,0.6)',
            },
          ].map(({ icon: Icon, label, value, color, glow }) => (
            <div
              key={label}
              className={`bg-gray-800 rounded-lg p-6 shadow-lg flex items-center gap-4
                transition duration-300 ease-in-out
                hover:scale-[1.03] cursor-pointer`}
              style={{ boxShadow: `0 0 8px 2px ${glow}` }}
            >
              <Icon size={48} className={color} />
              <div>
                <h2 className="text-2xl font-semibold">{label}</h2>
                <p className="text-4xl font-bold">{value}</p>
              </div>
            </div>
          ))}
        </>
      </div>

      <div className="max-w-xl mx-auto mb-12 bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
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

      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-700 bg-gray-900 p-6">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800 sticky top-0">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-300 font-medium">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">
                  <button 
                   onClick={() => openQRCodeModal(p.trackingId ?? p.TrackingId)}
                   class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                    <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                      Show QR
                    </span>
                  </button>               
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔳 QR Code Modal */}
      {showQrModal && (
        <QRCodeModal qrCode={qrCode} onClose={closeQRCodeModal} />
      )}
    </div>
  );
}