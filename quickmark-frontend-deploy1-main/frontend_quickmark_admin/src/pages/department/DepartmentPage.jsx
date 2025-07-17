// src/pages/department/DepartmentPage.jsx
import React, { useState, useMemo } from "react";
import { Plus, Trash2, Search, X } from "lucide-react";
import Pagination from "../../components/common/Pagination";

// --- Add Department Modal (No changes needed here) ---
const AddDepartmentModal = ({ onClose, onSave }) => {
  const [name, setName] = useState("");
  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    if (name.trim()) { 
      try {
        await onSave(name.trim());
        onClose(); // Close modal after successful save
      } catch (error) {
        // Keep modal open if there's an error
        console.error('Error saving department:', error);
      }
    } 
  };
  return ( <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"><div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm"><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">Add New Department</h3><button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button></div><form onSubmit={handleSubmit}><label htmlFor="departmentName" className="block text-sm font-medium text-gray-700">Department Name</label><input id="departmentName" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required /><div className="flex justify-end mt-4"><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button></div></form></div></div> );
};

// --- Main Department Page Component ---
export default function DepartmentPage({ 
  departments, 
  onAdd, 
  onDelete, 
  onSelectDepartment,
  pagination = { page: 1, totalPages: 1, totalItems: 0 },
  onPageChange,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDepartments = useMemo(
    () => departments.filter((dept) => (dept.name || '').toLowerCase().includes(searchTerm.toLowerCase())),
    [departments, searchTerm]
  );

  return (
    <>
      {isModalOpen && (<AddDepartmentModal onClose={() => setIsModalOpen(false)} onSave={onAdd} />)}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Departments</h2>
            <div className="flex items-center space-x-2">
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600"><Plus size={18} /> Add</button>
            </div>
          </div>
          <div className="relative mb-6"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><Search size={20} className="text-gray-400" /></span><input type="text" placeholder="Search departments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          
          {filteredDepartments.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredDepartments.map((dept) => (
                <div key={dept.department_id} className="group relative">
                  {/* --- IMPROVED DESIGN and functionality --- */}
                  <button
                    onClick={() => onSelectDepartment(dept.name)}
                    className="w-full h-24 bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold rounded-lg flex items-center justify-center text-center p-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    {dept.name}
                  </button>
                  <button onClick={() => onDelete(dept.department_id)} className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700">
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500"><p>No departments found.</p></div>
          )}
        </div>
        
        {/* Pagination */}
        {pagination && onPageChange && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            onPageChange={onPageChange}
            itemsPerPage={10}
          />
        )}
      </div>
    </>
  );
}
