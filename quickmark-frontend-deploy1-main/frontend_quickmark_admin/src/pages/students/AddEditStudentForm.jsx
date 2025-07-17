// src/pages/students/AddEditStudentForm.jsx
import React, { useState, useEffect } from 'react';

export default function AddEditStudentForm({ student, onSave, onBack, allDepartments }) {
  // Set up state to manage the form's input fields
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    email: '',
    parentEmail: '',
    startYear: '',
    department_id: '',
    department: '',
    section: 'A'
  });

  // This effect runs when the 'student' prop changes.
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        rollNo: student.rollNo || '',
        email: student.email || '',
        parentEmail: student.parentEmail || '',
        startYear: student.startYear || '',
        department_id: student.department_id || '',
        department: student.department || '',
        section: student.section || 'A'
      });
    } else {
      // Reset form for adding a new student
      setFormData({
        name: '', 
        rollNo: '', 
        email: '', 
        parentEmail: '', 
        startYear: '', 
        department_id: '',
        department: '',
        section: 'A'
      });
    }
  }, [student]);

  // This function updates the state whenever a user types in an input field
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({ ...prevData, [id]: value }));
  };
  
  // This function is called when the form is submitted
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNo || !formData.email || !formData.startYear || !formData.department_id || !formData.section) {
      alert('Please fill out all required fields.');
      return;
    }
    onSave(student ? student.student_id : null, formData);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-lg mx-auto">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">{student ? `Edit ${student.name}` : 'Add New Student'}</h3>
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Student Name */}
                <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="name">Student Name *</label>
                    <input id="name" type="text" value={formData.name} onChange={handleChange} required className="shadow-sm border rounded w-full py-2 px-3"/>
                </div>
                {/* Roll Number */}
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="rollNo">Roll Number *</label>
                    <input id="rollNo" type="text" value={formData.rollNo} onChange={handleChange} required className="shadow-sm border rounded w-full py-2 px-3"/>
                </div>
                {/* Start Year */}
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="startYear">Start Year *</label>
                    <input id="startYear" type="number" placeholder="e.g., 2023" value={formData.startYear} onChange={handleChange} required className="shadow-sm border rounded w-full py-2 px-3"/>
                </div>
                {/* Department */}
                <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="department_id">Department *</label>
                    <select id="department_id" value={formData.department_id} onChange={handleChange} required className="shadow-sm border rounded w-full py-2 px-3">
                        <option value="">Select Department</option>
                        {allDepartments?.map((dept) => (
                            <option key={dept.department_id} value={dept.department_id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Section */}
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="section">Section *</label>
                    <select id="section" value={formData.section} onChange={handleChange} required className="shadow-sm border rounded w-full py-2 px-3">
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                    </select>
                </div>
                {/* Email */}
                <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="email">Email *</label>
                    <input id="email" type="email" value={formData.email} onChange={handleChange} required className="shadow-sm border rounded w-full py-2 px-3"/>
                </div>
                {/* Parent's Email */}
                <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="parentEmail">Parent's Email</label>
                    <input id="parentEmail" type="email" value={formData.parentEmail} onChange={handleChange} className="shadow-sm border rounded w-full py-2 px-3" placeholder="Optional"/>
                </div>
            </div>
            {/* Form Actions */}
            <div className="flex justify-end space-x-4 mt-8">
                <button type="button" onClick={onBack} className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600">Cancel</button>
                <button type="submit" className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600">Save</button>
            </div>
        </form>
    </div>
  );
}