import React, { useEffect, useState } from 'react';
import { createParcel, fetchMyParcels } from '../api/parcel';
import LogoutButton from '../components/LogoutButton';
import DashboardHeader from '../components/DashboardHeader';
import TimelineModal from '../components/TimelineModal';
import { fetchTimeline } from '../api/timeline';

export default function SenderDashboard() {
  const [recipientName, setRecipientName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [result, setResult] = useState(null);
  const [myParcels, setMyParcels] = useState([]);
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);

  const handleCreate = async () => {
    if (!recipientName.trim() || !deliveryAddress.trim()) {
      alert('Please enter both Recipient Name and Delivery Address');
      return;
    }
    try {
      const data = await createParcel({
        recipientName: recipientName.trim(),
        deliveryAddress: deliveryAddress.trim(),
      });
      setResult(data);
      fetchParcels();
    } catch (error) {
      console.error('Failed to create parcel:', error);
      alert('Failed to create parcel');
    }
  };

  const fetchParcels = async () => {
    try {
      const data = await fetchMyParcels();
      setMyParcels(data);
    } catch (error) {
      console.error('Failed to load your parcels:', error);
      alert('Failed to load your parcels');
    }
  };

  const handleViewTimeline = async (trackingId) => {
    try {
      const timeline = await fetchTimeline(trackingId);
      setSelectedTimeline(timeline);
      setShowTimeline(true);
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
      alert('Failed to fetch timeline');
    }
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <DashboardHeader title="Sender Dashboard" />

      <div className="p-4 bg-gray-50 rounded shadow">
        <h3 className="text-xl font-semibold mb-2">Create Parcel</h3>
        <input
          type="text"
          placeholder="Recipient Name"
          className="border p-2 w-full mb-2"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Delivery Address"
          className="border p-2 w-full mb-2"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
        />
        <button
          onClick={handleCreate}
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={!recipientName.trim() || !deliveryAddress.trim()}
        >
          Create Parcel
        </button>
        {result && (
          <div className="mt-4">
            <p className="font-medium">Tracking ID: {result.trackingId}</p>
            <img src={result.qrCode} alt="QR Code" className="w-32 h-32 mt-2" />
          </div>
        )}
      </div>

      <div className="p-4 bg-white rounded shadow">
        <h3 className="text-lg font-semibold mb-2">My Parcels</h3>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Tracking ID</th>
              <th className="p-2 border">Recipient</th>
              <th className="p-2 border">Address</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Timeline</th>
            </tr>
          </thead>
          <tbody>
            {myParcels.map((p) => (
              <tr key={p.trackingId}>
                <td className="p-2 border">{p.trackingId}</td>
                <td className="p-2 border">{p.recipientName}</td>
                <td className="p-2 border">{p.deliveryAddress}</td>
                <td className="p-2 border">{p.status}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleViewTimeline(p.trackingId)}
                    className="text-blue-600 underline"
                  >
                    View Timeline
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showTimeline && selectedTimeline && (
        <TimelineModal
          timeline={selectedTimeline}
          onClose={() => setShowTimeline(false)}
          handlersMap={{}} // not required for Sender
        />
      )}

      <LogoutButton />
    </div>
  );
}