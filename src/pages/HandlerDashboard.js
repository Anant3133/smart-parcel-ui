import React, { useEffect, useState, useMemo } from 'react';
import { logHandover } from '../api/handover';
import { getParcelsHandledByHandler } from '../api/parcel';
import { fetchUsers } from '../api/admin';
import DashboardHeader from '../components/DashboardHeader';
import TimelineModal from '../components/TimelineModal';
import { fetchTimeline } from '../api/timeline';

export default function HandlerDashboard() {
  const [trackingId, setTrackingId] = useState('');
  const [location, setLocation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [result, setResult] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);

  const statusFlow = ['Received', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

  const handlersMap = useMemo(() => {
    const map = {};
    users.forEach(user => {
      if (user.role?.toLowerCase() === 'handler') {
        map[user.id] = user.email || 'Unknown Handler';
      }
    });
    return map;
  }, [users]);

  const handleLogHandover = async () => {
    if (!trackingId.trim() || !location.trim() || !selectedStatus) {
      alert('Please enter Tracking ID, Location, and select Status');
      return;
    }

    try {
      const data = await logHandover({
        ParcelTrackingId: trackingId.trim(),
        currentLocation: location.trim(),
        status: selectedStatus,
      });
      setResult(data);
      setTrackingId('');
      setLocation('');
      setSelectedStatus('');
      await fetchParcels();
    } catch (error) {
      console.error('Handover logging failed:', error);
      alert('Handover failed. Check Tracking ID and try again.');
    }
  };

  const fetchParcels = async () => {
    try {
      const data = await getParcelsHandledByHandler();
      console.log("Fetched parcels:", data);
      setParcels(data);
    } catch (error) {
      console.error('Failed to fetch handled parcels:', error);
      alert('Failed to fetch handled parcels');
    }
  };

  const loadTimeline = async (id) => {
    if (!id) {
      console.error('Invalid tracking ID passed to loadTimeline:', id);
      return;
    }

    try {
      const data = await fetchTimeline(id);
      setSelectedTimeline(data);
      setShowTimeline(true);
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
      alert('Failed to fetch timeline');
    }
  };

  useEffect(() => {
    fetchParcels();
    (async () => {
      try {
        const u = await fetchUsers();
        setUsers(u);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    })();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader title="Handler Dashboard" />

      {/* Log Handover Section */}
      <div className="max-w-xl mx-auto space-y-4">
        <h3 className="text-xl font-semibold">Log Handover</h3>

        <input
          type="text"
          placeholder="Tracking ID"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border p-2 w-full"
        />

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Select Status</option>
          {statusFlow.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <button
          onClick={handleLogHandover}
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={!trackingId.trim() || !location.trim() || !selectedStatus}
        >
          Submit Handover
        </button>

        {result && (
          <div className="mt-4 p-3 border rounded bg-gray-100">
            <p>{result.message}</p>
            {result.tampered && (
              <p className="text-red-600">Tampering Detected: {result.tamperNote}</p>
            )}
          </div>
        )}
      </div>

      {/* Handled Parcels */}
      <div>
        <h3 className="text-lg font-semibold mt-8 mb-2">Parcels You've Handled</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Tracking ID</th>
                <th className="border p-2">Recipient</th>
                <th className="border p-2">Location</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parcels.map((p) => {
                console.log("Parcel object:", p);
                const tracking = p.ParcelTrackingId || p.trackingId || p.trackingID;
                return (
                  <tr key={tracking}>
                    <td className="border p-2">{tracking}</td>
                    <td className="border p-2">{p.recipientName || 'N/A'}</td>
                    <td className="border p-2">{p.currentLocation || 'N/A'}</td>
                    <td className="border p-2">{p.status || 'N/A'}</td>
                    <td className="border p-2 space-x-2">
                      <button
                        className="text-blue-600 underline"
                        onClick={() => loadTimeline(tracking)}
                      >
                        View Timeline
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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