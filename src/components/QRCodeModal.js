import React from 'react';

export default function QRCodeModal({ qrCode, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
        <h2 className="text-white mb-4 text-lg font-semibold">Parcel QR Code</h2>
        {qrCode ? (
          <img src={qrCode} alt="Parcel QR Code" className="mx-auto" />
        ) : (
          <p className="text-gray-400">Loading...</p>
        )}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}