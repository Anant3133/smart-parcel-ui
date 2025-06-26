import React from 'react';

export default function SearchAndFilterControls({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  statusFlow,
  onReset,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-850 bg-opacity-60 backdrop-blur-md p-4 rounded-lg shadow-lg">
      <input
        type="text"
        placeholder="Search by Tracking ID or Recipient"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-grow p-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="p-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="all">All Statuses</option>
        {statusFlow.map((status) => (
          <option key={status} value={status.toLowerCase()}>
            {status}
          </option>
        ))}
      </select>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-semibold"
        title="Reset filters"
        type="button"
      >
        Reset
      </button>
    </div>
  );
}
