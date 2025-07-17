// src/pages/subjects/AddEditSubjectModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function AddEditSubjectModal({ subject, allDepartments, allFaculty, onClose, onSave }) {
  const [formData, setFormData] = useState({ name: '', subject_code: '', department: '', faculty: '', startYear: new Date().getFullYear() });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name || '',
        subject_code: subject.subject_code || '',
        department: subject.department || '',
        faculty: subject.faculty || '',
        startYear: subject.startYear || new Date().getFullYear(),
      });
    }
  }, [subject]);

  const departmentNames = useMemo(() => allDepartments.map(d => d.name), [allDepartments]);
  const facultyNames = useMemo(() => allFaculty.map(f => f.name), [allFaculty]);

  // --- NEW: A robust validation function ---
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
        newErrors.name = "Subject name is required.";
    }
    if (!formData.subject_code.trim()) {
        newErrors.subject_code = "Subject code is required.";
    }
    // Check if the entered department exists in the master list.
    if (!departmentNames.includes(formData.department)) {
      newErrors.department = "Please select a valid department from the list.";
    }
    // Check if the entered faculty exists in the master list.
    if (!facultyNames.includes(formData.faculty)) {
      newErrors.faculty = "Please select a valid faculty member from the list.";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // As the user types, clear the error for that field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // Stop submission if there are validation errors
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{subject ? 'Edit Subject' : 'Add New Subject'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>
          
          <div>
            <label htmlFor="subject_code" className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
            <input
              id="subject_code"
              type="text"
              name="subject_code"
              value={formData.subject_code}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.subject_code ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g. DE101"
            />
            {errors.subject_code && (
              <div className="flex items-center text-red-600 text-xs mt-1">
                <AlertCircle size={14} className="mr-1" />
                {errors.subject_code}
              </div>
            )}
          </div>
          
          {/* --- UPDATED: Department field with native autocomplete and validation --- */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              id="department"
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              list="department-list"
              className={`w-full p-2 border rounded-md ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Type to search departments..."
            />
            <datalist id="department-list">
              {departmentNames.map(name => <option key={name} value={name} />)}
            </datalist>
            {errors.department && (
              <div className="flex items-center text-red-600 text-xs mt-1">
                <AlertCircle size={14} className="mr-1" />
                {errors.department}
              </div>
            )}
          </div>
          
          {/* --- UPDATED: Faculty field with native autocomplete and validation --- */}
          <div>
            <label htmlFor="faculty" className="block text-sm font-medium text-gray-700 mb-1">Assigned Faculty</label>
            <input
              id="faculty"
              type="text"
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              list="faculty-list"
              className={`w-full p-2 border rounded-md ${errors.faculty ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Type to search faculty..."
            />
            <datalist id="faculty-list">
              {facultyNames.map(name => <option key={name} value={name} />)}
            </datalist>
            {errors.faculty && (
              <div className="flex items-center text-red-600 text-xs mt-1">
                <AlertCircle size={14} className="mr-1" />
                {errors.faculty}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Subject</button>
          </div>
        </form>
      </div>
    </div>
  );
}
