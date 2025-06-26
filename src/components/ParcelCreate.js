import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { createParcel } from '../api/parcel';

export default function CreateParcelForm({ onParcelCreated }) {
  const [recipientName, setRecipientName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [parcelCategory, setParcelCategory] = useState('');
  const [weight, setWeight] = useState('');
  const [creatingParcel, setCreatingParcel] = useState(false);
  const [result, setResult] = useState(null);

  const handleCreate = async () => {
    if (!recipientName.trim() || !deliveryAddress.trim()) {
      toast.error('Please enter Recipient Name and Delivery Address');
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
      if (onParcelCreated) onParcelCreated();  // To trigger refresh in parent

      // Reset form
      setRecipientName('');
      setDeliveryAddress('');
      setSenderAddress('');
      setParcelCategory('');
      setWeight('');
    } catch (error) {
      console.error('Create parcel failed:', error);
      toast.error('Failed to create parcel');
    } finally {
      setCreatingParcel(false);
    }
  };

  return (
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

        <button
          onClick={handleCreate}
          disabled={creatingParcel}
          className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-3 rounded-lg shadow-md transition flex justify-center items-center space-x-2 disabled:opacity-50"
        >
          {creatingParcel && (
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
          <span>Create Parcel</span>
        </button>

        {result && (
          <div className="mt-6 bg-gray-800 rounded-lg p-5 border border-green-500 shadow-md flex items-center space-x-6">
            <div>
              <p className="text-lg font-semibold text-green-400">Tracking ID:</p>
              <p className="text-xl font-bold text-white">{result.trackingId}</p>
            </div>
            <img
              src={result.qrCode}
              alt="QR Code"
              className="w-32 h-32 rounded-md shadow-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}
