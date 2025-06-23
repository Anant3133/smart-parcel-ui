import React from 'react';

export default function ShowStatusButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      type="button"
    >
      Show Status
    </button>
  );
}