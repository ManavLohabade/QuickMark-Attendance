import React, { useState } from 'react';

const mockYears = [1, 2, 3, 4];
const mockSections = ['A', 'B', 'C'];

export default function FaceYearSectionModal({ isOpen, onClose, onSubmit }) {
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (year && section) {
      onSubmit({ year, section });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
        <h2 className="text-xl font-bold mb-4 text-center">Select Year & Section</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Year</label>
            <select value={year} onChange={e => setYear(e.target.value)} className="w-full p-2 border rounded" required>
              <option value="">-- Select Year --</option>
              {mockYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Section</label>
            <select value={section} onChange={e => setSection(e.target.value)} className="w-full p-2 border rounded" required>
              <option value="">-- Select Section --</option>
              {mockSections.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-between mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
} 