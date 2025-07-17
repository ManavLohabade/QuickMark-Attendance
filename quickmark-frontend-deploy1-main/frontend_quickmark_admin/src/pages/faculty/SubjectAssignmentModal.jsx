import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Minus } from 'lucide-react';

export default function SubjectAssignmentModal({ 
  faculty, 
  allSubjects = [], 
  currentAssignments = [], 
  onClose, 
  onAssignSubject, 
  onRemoveSubject 
}) {
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loading, setLoading] = useState(false);

  // Get subjects that are not currently assigned
  const availableSubjects = allSubjects.filter(subject => 
    !currentAssignments.some(assignment => assignment.subject_id === subject.subject_id)
  );

  const handleAssignSubject = async () => {
    if (!selectedSubjectId) return;
    
    try {
      setLoading(true);
      await onAssignSubject(faculty.faculty_id, selectedSubjectId);
      setSelectedSubjectId('');
    } catch (error) {
      console.error('Error assigning subject:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubject = async (subjectId) => {
    try {
      setLoading(true);
      await onRemoveSubject(faculty.faculty_id, subjectId);
    } catch (error) {
      console.error('Error removing subject:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Assign Subjects to {faculty?.name}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Current Assignments */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Currently Assigned Subjects</h3>
          {currentAssignments.length === 0 ? (
            <p className="text-gray-500 text-sm">No subjects assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {currentAssignments.map((assignment) => (
                <div key={assignment.subject_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{assignment.subject_name}</p>
                    <p className="text-sm text-gray-600">
                      {assignment.department_name} • Year {assignment.year} • Section {assignment.section} • Semester {assignment.semester}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveSubject(assignment.subject_id)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Minus size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assign New Subject */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Assign New Subject</h3>
          <div className="flex gap-3">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || availableSubjects.length === 0}
            >
              <option value="">Select a subject...</option>
              {availableSubjects.map((subject) => (
                <option key={subject.subject_id} value={subject.subject_id}>
                  {subject.subject_name} ({subject.department_name} • Year {subject.year} • Section {subject.section} • Semester {subject.semester})
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignSubject}
              disabled={!selectedSubjectId || loading || availableSubjects.length === 0}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={16} />
              Assign
            </button>
          </div>
          {availableSubjects.length === 0 && (
            <p className="text-gray-500 text-sm mt-2">All subjects are already assigned to this faculty member.</p>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 