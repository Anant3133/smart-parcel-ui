import React from 'react';
import toast from 'react-hot-toast';
import { raiseTamperAlert } from '../api/tamper';

export default function TamperAlertButton({ trackingId }) {
  const handleRaiseAlert = async () => {
    try {
      const res = await raiseTamperAlert({
        parcelTrackingId: trackingId,
        note: 'Tamper alert manually raised by handler.',
      });
      toast.success(res.message || 'Tamper alert sent!');
    } catch (error) {
      console.error('Tamper alert failed:', error);
      toast.error('Failed to raise tamper alert');
    }
  };

  return (
    <button
      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
      onClick={handleRaiseAlert}
      title="Raise Tamper Alert"
      type="button"
    >
      Raise Alert
    </button>
  );
}
