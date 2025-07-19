import React, { useState } from 'react';

const MarkAttendance = ({ subjects, onStart }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  const handleStartClick = () => {
    if (selectedSubjectId) {
      const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
      onStart(selectedSubject);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-text-primary">Mark Attendance</h2>
        <p className="text-text-secondary mt-1">Select a subject to begin generating the QR code.</p>
      </div>

      {/* Subject Selection Card */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-text-primary">Select Subject</h3>
        </div>
        
        {/* Table for subjects */}
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider"></th>
                        <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Subject Name</th>
                        <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Year</th>
                        <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Section</th>
                        <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Department</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                    {subjects.map((subject) => (
                        <tr 
                            key={subject.id} 
                            className={`cursor-pointer hover:bg-gray-50 ${selectedSubjectId === subject.id ? 'bg-primary-light/10' : ''}`}
                            onClick={() => setSelectedSubjectId(subject.id)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                    type="radio"
                                    name="subject-selection"
                                    checked={selectedSubjectId === subject.id}
                                    onChange={() => setSelectedSubjectId(subject.id)}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-text-primary">{subject.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-text-secondary">{subject.year}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-text-secondary">{subject.section}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-text-secondary">{subject.department}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Action Button */}
        <div className="p-6 border-t border-border-color text-right">
            <button
                onClick={handleStartClick}
                disabled={!selectedSubjectId}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                Start Attendance
            </button>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
