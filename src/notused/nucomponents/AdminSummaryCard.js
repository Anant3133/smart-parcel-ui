import React from 'react';

export default function AdminSummaryCard({ icon: Icon, label, value, color, glow }) {
  return (
    <div
      className={`bg-gray-800 rounded-lg p-6 shadow-lg flex items-center gap-4
        transition duration-300 ease-in-out hover:scale-[1.03] cursor-pointer`}
      style={{ boxShadow: `0 0 8px 2px ${glow || 'rgba(0,0,0,0.5)'}` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 15px 4px ${glow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 8px 2px ${glow || 'rgba(0,0,0,0.5)'}`;
      }}
    >
      <Icon size={48} className={color} />
      <div>
        <h2 className="text-2xl font-semibold">{label}</h2>
        <p className="text-4xl font-bold">{value}</p>
      </div>
    </div>
  );
}
