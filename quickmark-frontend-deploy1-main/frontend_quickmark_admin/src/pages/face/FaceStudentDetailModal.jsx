import React, { useEffect, useState } from 'react';
import { studentAPI } from '../../utils/api';

export default function FaceStudentDetailModal({ student, isOpen, onClose }) {
  const [photoHistory, setPhotoHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && student && student.student_id) {
      setLoading(true);
      studentAPI.getPhotoHistory(student.student_id)
        .then(res => setPhotoHistory(res.history || []))
        .catch(() => setPhotoHistory([]))
        .finally(() => setLoading(false));
    } else {
      setPhotoHistory([]);
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl">&times;</button>
        <div className="flex flex-col items-center">
          <img src={student.facePhoto || student.photo_url} alt={student.name} className="w-32 h-32 object-cover rounded-full mb-4 border" />
          <h2 className="text-xl font-bold mb-2">{student.name}</h2>
          <div className="mb-2 text-gray-700">
            <div><span className="font-medium">Roll No.:</span> {student.rollNo || student.roll_number}</div>
            <div><span className="font-medium">Student ID:</span> {student.student_id}</div>
            {/* Add more details as needed */}
          </div>
          <div className="w-full mt-4">
            <h3 className="font-semibold mb-2">Photo Update History</h3>
            {loading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : photoHistory.length === 0 ? (
              <div className="text-sm text-gray-500">No photo history found.</div>
            ) : (
              <ul className="text-sm text-gray-600 space-y-2">
                {photoHistory.map((h, i) => (
                  <li key={h.history_id || i} className="flex items-center space-x-3">
                    <img src={h.photo_url} alt="history" className="w-12 h-12 object-cover rounded border" />
                    <div>
                      <div><span className="font-medium">By:</span> {h.uploaded_by_role || 'Unknown'}</div>
                      <div><span className="font-medium">At:</span> {new Date(h.uploaded_at).toLocaleString()}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 