import React, { useState } from 'react';

export default function HandoverLogForm({
  statusFlow,
  onSubmit,
  loading = false,
}) {
  const [trackingId, setTrackingId] = useState('');
  const [location, setLocation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleSubmit = () => {
    if (!trackingId.trim() || !location.trim() || !selectedStatus) {
      return; // Validation should be handled by parent or with an error state
    }
    onSubmit({ trackingId: trackingId.trim(), location: location.trim(), status: selectedStatus });
    setTrackingId('');
    setLocation('');
    setSelectedStatus('');
  };

  const isDisabled = !trackingId.trim() || !location.trim() || !selectedStatus || loading;

  return (
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
          {statusFlow.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </label>

      <button
        disabled={isDisabled}
        onClick={handleSubmit}
        className={`mt-4 py-3 rounded-md font-semibold text-lg transition
          ${isDisabled ? 'bg-gray-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'}
        `}
      >
        Submit Handover
      </button>
    </section>
  );
}
