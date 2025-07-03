import React from 'react';

export default function AdminStatsCard({ icon: Icon, label, value, color, glow }) {
  return (
    <div
      className="bg-gray-800 rounded-lg p-6 shadow-lg flex items-center gap-5 cursor-pointer
        transition-transform transform duration-300 ease-in-out hover:scale-105"
      style={{
        boxShadow: '0 0 10px 2px rgba(0,0,0,0.6)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 20px 5px ${glow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 0 10px 2px rgba(0,0,0,0.6)';
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
