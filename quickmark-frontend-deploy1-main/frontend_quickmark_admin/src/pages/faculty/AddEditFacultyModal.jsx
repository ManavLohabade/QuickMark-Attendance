// src/pages/faculty/AddEditFacultyModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AddEditFacultyModal({ facultyMember, onClose, onSave, allDepartments = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department_id: '',
    designation: 'Faculty'
  });

  useEffect(() => {
    if (facultyMember) {
      setFormData({
        name: facultyMember.name || '',
        email: facultyMember.email || '',
        password: '', // Don't populate password for editing
        department_id: facultyMember.department_id || '',
        designation: facultyMember.designation || 'Faculty'
      });
    }
  }, [facultyMember]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.department_id) {
      alert('Please fill in all required fields (Name, Email, and Department).');
      return;
    }
    
    // For new faculty, password is required
    if (!facultyMember && !formData.password) {
      alert('Password is required for new faculty members.');
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{facultyMember ? 'Edit Faculty' : 'Add New Faculty'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="name" 
                id="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="w-full p-2 border rounded-md" 
                placeholder="e.g., Dr. John Doe"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input 
                type="email" 
                name="email" 
                id="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="w-full p-2 border rounded-md" 
                placeholder="e.g., john.doe@university.edu"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password {!facultyMember && <span className="text-red-500">*</span>}
              </label>
              <input 
                type="password" 
                name="password" 
                id="password" 
                value={formData.password} 
                onChange={handleChange} 
                required={!facultyMember}
                className="w-full p-2 border rounded-md" 
                placeholder={facultyMember ? "Leave blank to keep current password" : "Enter password"}
              />
              {facultyMember && (
                <p className="text-sm text-gray-500 mt-1">Leave blank to keep current password</p>
              )}
            </div>
            
            <div>
              <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select 
                name="department_id" 
                id="department_id" 
                value={formData.department_id} 
                onChange={handleChange} 
                required 
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select Department</option>
                {allDepartments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                Designation
              </label>
              <input 
                type="text" 
                name="designation" 
                id="designation" 
                value={formData.designation} 
                onChange={handleChange} 
                className="w-full p-2 border rounded-md" 
                placeholder="e.g., Professor, Assistant Professor"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-8">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {facultyMember ? 'Update Faculty' : 'Save Faculty'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
