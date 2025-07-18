import React, { useState } from 'react';

// Mock student data
const mockStudents = [
  {
    student_id: '1',
    name: 'Alice Smith',
    rollNo: 'BTECE001',
    facePhoto: 'https://randomuser.me/api/portraits/women/1.jpg',
    lastUpdated: '2024-07-18 10:00',
  },
  {
    student_id: '2',
    name: 'Bob Johnson',
    rollNo: 'BTECE002',
    facePhoto: 'https://randomuser.me/api/portraits/men/2.jpg',
    lastUpdated: '2024-07-17 09:30',
  },
  {
    student_id: '3',
    name: 'Carol Lee',
    rollNo: 'BTECE003',
    facePhoto: 'https://randomuser.me/api/portraits/women/3.jpg',
    lastUpdated: '2024-07-16 14:20',
  },
  // ...add more mock students as needed
];

const PAGE_SIZE = 6;

export default function FaceStudentCardGrid({ onSelectStudent }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const students = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Students</h1>
        <input
          type="text"
          placeholder="Search by name or roll no..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="p-2 border rounded w-64"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {students.map(student => (
          <button
            key={student.student_id}
            onClick={() => onSelectStudent(student)}
            className="bg-white shadow rounded-lg p-4 flex flex-col items-center hover:bg-blue-100 transition"
          >
            <img src={student.facePhoto} alt={student.name} className="w-24 h-24 object-cover rounded-full mb-2 border" />
            <span className="font-semibold text-lg mb-1">{student.name}</span>
            <span className="text-gray-600 text-sm mb-1">{student.rollNo}</span>
            <span className="text-xs text-gray-500">Last updated: {student.lastUpdated}</span>
          </button>
        ))}
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-6 space-x-2">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >Next</button>
      </div>
    </div>
  );
} 