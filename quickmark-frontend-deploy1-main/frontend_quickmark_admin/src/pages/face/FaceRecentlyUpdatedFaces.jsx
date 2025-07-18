import React from 'react';

const mockRecent = [
  {
    student_id: '1',
    name: 'Alice Smith',
    facePhoto: 'https://randomuser.me/api/portraits/women/1.jpg',
    updatedAgo: '2 min ago',
  },
  {
    student_id: '2',
    name: 'Bob Johnson',
    facePhoto: 'https://randomuser.me/api/portraits/men/2.jpg',
    updatedAgo: '10 min ago',
  },
  {
    student_id: '3',
    name: 'Carol Lee',
    facePhoto: 'https://randomuser.me/api/portraits/women/3.jpg',
    updatedAgo: '1 hr ago',
  },
  // ...add more as needed
];

export default function FaceRecentlyUpdatedFaces({ onSelectStudent }) {
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-lg font-bold mb-2">Recently Updated Faces</h2>
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {mockRecent.map(student => (
          <button
            key={student.student_id}
            onClick={() => onSelectStudent(student)}
            className="flex flex-col items-center bg-white shadow rounded-lg p-3 min-w-[120px] hover:bg-blue-100 transition"
          >
            <img src={student.facePhoto} alt={student.name} className="w-16 h-16 object-cover rounded-full mb-1 border" />
            <span className="text-sm font-medium mb-0.5">{student.name}</span>
            <span className="text-xs text-gray-500">{student.updatedAgo}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 