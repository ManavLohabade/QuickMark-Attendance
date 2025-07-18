import React from 'react';

const mockDepartments = {
  '1': [ // B.Tech
    { department_id: 'ece', name: 'ECE' },
    { department_id: 'it', name: 'IT' },
    { department_id: 'cse', name: 'CSE' },
  ],
  '2': [ // M.Tech
    { department_id: 'vlsi', name: 'VLSI' },
    { department_id: 'power', name: 'Power Systems' },
  ],
  '3': [ // MBA
    { department_id: 'hr', name: 'HR' },
    { department_id: 'finance', name: 'Finance' },
  ],
  '4': [ // PhD
    { department_id: 'research', name: 'Research' },
  ],
};

export default function FaceDepartmentSelection({ degree, onSelectDepartment }) {
  const departments = mockDepartments[degree.degree_id] || [];
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Select Department ({degree.name})</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {departments.map(dept => (
          <button
            key={dept.department_id}
            onClick={() => onSelectDepartment(dept)}
            className="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:bg-blue-100 transition"
          >
            <span className="text-lg font-semibold mb-2">{dept.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 