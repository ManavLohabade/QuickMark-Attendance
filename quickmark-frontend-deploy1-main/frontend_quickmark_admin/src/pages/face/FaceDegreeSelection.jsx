import React from 'react';

const mockDegrees = [
  { degree_id: '1', name: 'B.Tech' },
  { degree_id: '2', name: 'M.Tech' },
  { degree_id: '3', name: 'MBA' },
  { degree_id: '4', name: 'PhD' },
];

export default function FaceDegreeSelection({ onSelectDegree }) {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Select Degree</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockDegrees.map(degree => (
          <button
            key={degree.degree_id}
            onClick={() => onSelectDegree(degree)}
            className="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:bg-blue-100 transition"
          >
            <span className="text-lg font-semibold mb-2">{degree.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 