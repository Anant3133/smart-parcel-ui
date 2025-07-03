import React from 'react';
import ShowStatusButton from './ShowStatusButton';
import { FiPackage, FiClock, FiAlertCircle } from 'react-icons/fi';

export default function ParcelsTable({ parcels, loading, onShowStatus, onShowTimeline }) {
  return (
    <div className="max-w-7xl mx-auto bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 overflow-x-auto">
      <h3 className="text-2xl font-bold mb-5 text-white flex items-center space-x-2">
        <FiPackage className="text-green-400" />
        <span>My Parcels</span>
      </h3>
      {loading ? (
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
            {parcels.map((p) => (
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
                  <ShowStatusButton onClick={() => onShowStatus(p.trackingId)} />
                </td>
                <td className="p-3 border border-gray-700 flex items-center justify-center">
                  <button
                    onClick={() => onShowTimeline(p.trackingId)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded flex items-center justify-center space-x-1 transition"
                  >
                    <FiClock size={18} />
                    <span>View Timeline</span>
                  </button>
                </td>
              </tr>
            ))}
            {parcels.length === 0 && (
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
  );
}
