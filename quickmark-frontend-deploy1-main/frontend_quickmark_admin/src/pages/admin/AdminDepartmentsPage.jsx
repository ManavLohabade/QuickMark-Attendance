// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import { PlusCircle, Edit, Trash2 } from 'lucide-react';

// // const AdminDepartmentsPage = () => {
// //     const [departments, setDepartments] = useState([]);
// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState('');
// //     const [newDepartmentName, setNewDepartmentName] = useState('');
// //     const [editingDepartment, setEditingDepartment] = useState(null); // Stores department being edited {id, name}
// //     const [editDepartmentName, setEditDepartmentName] = useState('');

// //     const getAdminToken = () => localStorage.getItem('adminToken');

// //     const fetchDepartments = async () => {
// //         setLoading(true);
// //         setError('');
// //         try {
// //             const token = getAdminToken();
// //             if (!token) {
// //                 setError('Admin not authenticated. Please log in again.');
// //                 setLoading(false);
// //                 return;
// //             }
// //             const response = await axios.get('http://localhost:3700/api/admin/departments', {
// //                 headers: {
// //                     Authorization: `Bearer ${token}`
// //                 }
// //             });
// //             console.log('DepartmentsManager: Fetched Departments Data:', response.data); // DEBUG LOG
// //             setDepartments(response.data);
// //         } catch (err) {
// //             console.error('DepartmentsManager: Error fetching departments:', err.response ? err.response.data : err.message);
// //             setError(err.response?.data?.message || 'Failed to load departments. Please try again.');
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     useEffect(() => {
// //         console.log('DepartmentsManager: Component mounted/re-rendered'); // DEBUG LOG
// //         fetchDepartments();
// //     }, []);

// //     useEffect(() => {
// //         console.log('DepartmentsManager: Current Departments State:', departments); // DEBUG LOG
// //     }, [departments]);

// //     const handleCreateDepartment = async (e) => {
// //         e.preventDefault();
// //         setError('');
// //         if (!newDepartmentName.trim()) {
// //             setError('Department name cannot be empty.');
// //             return;
// //         }
// //         try {
// //             const token = getAdminToken();
// //             const response = await axios.post('http://localhost:3700/api/admin/departments', {
// //                 name: newDepartmentName
// //             }, {
// //                 headers: {
// //                     Authorization: `Bearer ${token}`,
// //                     'Content-Type': 'application/json'
// //                 }
// //             });
// //             alert(response.data.message);
// //             setNewDepartmentName('');
// //             fetchDepartments();
// //         } catch (err) {
// //             console.error('Error creating department:', err.response ? err.response.data : err.message);
// //             setError(err.response?.data?.message || 'Failed to create department.');
// //         }
// //     };

// //     const handleUpdateDepartment = async (e) => {
// //         e.preventDefault();
// //         setError('');
// //         if (!editDepartmentName.trim()) {
// //             setError('Department name cannot be empty.');
// //             return;
// //         }
// //         try {
// //             const token = getAdminToken();
// //             const response = await axios.put(`http://localhost:3700/api/admin/departments/${editingDepartment.department_id}`, {
// //                 name: editDepartmentName
// //             }, {
// //                 headers: {
// //                     Authorization: `Bearer ${token}`,
// //                     'Content-Type': 'application/json'
// //                 }
// //             });
// //             alert(response.data.message);
// //             setEditingDepartment(null);
// //             setEditDepartmentName('');
// //             fetchDepartments();
// //         } catch (err) {
// //             console.error('Error updating department:', err.response ? err.response.data : err.message);
// //             setError(err.response?.data?.message || 'Failed to update department.');
// //         }
// //     };

// //     const handleDeleteDepartment = async (departmentId) => {
// //         if (!window.confirm('Are you sure you want to delete this department?')) {
// //             return;
// //         }
// //         setError('');
// //         try {
// //             const token = getAdminToken();
// //             const response = await axios.delete(`http://localhost:3700/api/admin/departments/${departmentId}`, {
// //                 headers: {
// //                     Authorization: `Bearer ${token}`
// //                 }
// //             });
// //             alert(response.data.message);
// //             fetchDepartments();
// //         } catch (err) {
// //             console.error('Error deleting department:', err.response ? err.response.data : err.message);
// //             if (err.response?.status === 409) {
// //                 setError('Cannot delete department: It still has associated records (e.g., faculties, students, subjects).');
// //             } else {
// //                 setError(err.response?.data?.message || 'Failed to delete department.');
// //             }
// //         }
// //     };

// //     if (loading) return <div className="text-center text-xl mt-10">Loading Departments...</div>;
// //     if (error) return <div className="text-center text-red-500 text-xl mt-10">Error: {error}</div>;

// //     return (
// //         <div className="container mx-auto p-4">
// //             <h1 className="text-3xl font-bold mb-6 text-center">Manage Departments (Branches)</h1>

// //             {/* Create Department Form */}
// //             <form onSubmit={handleCreateDepartment} className="mb-8 p-4 border rounded-lg shadow-sm">
// //                 <h2 className="text-xl font-semibold mb-4">Add New Department (Branch)</h2>
// //                 <div className="flex items-end space-x-2">
// //                     <input
// //                         type="text"
// //                         placeholder="Department Name (e.g., Physics)"
// //                         value={newDepartmentName}
// //                         onChange={(e) => setNewDepartmentName(e.target.value)}
// //                         className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                         required
// //                     />
// //                     <button
// //                         type="submit"
// //                         className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center"
// //                     >
// //                         <PlusCircle size={20} className="mr-2" /> Add
// //                     </button>
// //                 </div>
// //             </form>

// //             {/* Departments List */}
// //             <div className="p-4 border rounded-lg shadow-sm">
// //                 <h2 className="text-xl font-semibold mb-4">Existing Departments (Branches)</h2>
// //                 {departments.length === 0 ? (
// //                     <p className="text-center text-gray-500">No departments found.</p>
// //                 ) : (
// //                     <table className="min-w-full bg-white border-collapse">
// //                         <thead>
// //                             <tr className="bg-gray-100 border-b">
// //                                 <th className="py-2 px-4 text-left">Name</th>
// //                                 <th className="py-2 px-4 text-left">ID</th>
// //                                 <th className="py-2 px-4 text-left">Actions</th>
// //                             </tr>
// //                         </thead>
// //                         <tbody>
// //                             {departments.map((dept) => (
// //                                 <tr key={dept.department_id} className="border-b last:border-b-0 hover:bg-gray-50">
// //                                     <td className="py-2 px-4">{dept.name}</td>
// //                                     <td className="py-2 px-4 text-xs text-gray-500">{dept.department_id}</td>
// //                                     <td className="py-2 px-4 flex space-x-2">
// //                                         <button
// //                                             onClick={() => { setEditingDepartment(dept); setEditDepartmentName(dept.name); }}
// //                                             className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"
// //                                             title="Edit"
// //                                         >
// //                                             <Edit size={18} />
// //                                         </button>
// //                                         <button
// //                                             onClick={() => handleDeleteDepartment(dept.department_id)}
// //                                             className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
// //                                             title="Delete"
// //                                         >
// //                                             <Trash2 size={18} />
// //                                         </button>
// //                                     </td>
// //                                 </tr>
// //                             ))}
// //                         </tbody>
// //                     </table>
// //                 )}
// //             </div>

// //             {/* Edit Department Modal/Form */}
// //             {editingDepartment && (
// //                 <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
// //                     <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
// //                         <h2 className="text-xl font-semibold mb-4">Edit Department</h2>
// //                         <form onSubmit={handleUpdateDepartment}>
// //                             <div className="mb-4">
// //                                 <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-2">
// //                                     Department Name
// //                                 </label>
// //                                 <input
// //                                     type="text"
// //                                     id="editName"
// //                                     value={editDepartmentName}
// //                                     onChange={(e) => setEditDepartmentName(e.target.value)}
// //                                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                                     required
// //                                 />
// //                             </div>
// //                             <div className="flex justify-end space-x-2">
// //                                 <button
// //                                     type="button"
// //                                     onClick={() => { setEditingDepartment(null); setEditDepartmentName(''); }}
// //                                     className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
// //                                 >
// //                                     Cancel
// //                                 </button>
// //                                 <button
// //                                     type="submit"
// //                                     className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
// //                                 >
// //                                     Save Changes
// //                                 </button>
// //                             </div>
// //                         </form>
// //                     </div>
// //                 </div>
// //             )}
// //         </div>
// //     );
// // };

// // export default AdminDepartmentsPage;

// //
// // import React, { useEffect, useState } from "react";
// // import axios from "axios";
// // import { PlusCircle, Edit, Trash2 } from "lucide-react";

// // export default function AdminDepartmentsPage() {
// //   const [departments, setDepartments] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");
// //   const [newName, setNewName] = useState("");
// //   const [editing, setEditing] = useState(null);
// //   const [editName, setEditName] = useState("");

// //   const fetchDepartments = async () => {
// //     setLoading(true);
// //     setError("");
// //     try {
// //       const token = localStorage.getItem("adminToken");
// //       const res = await axios.get("http://localhost:3700/api/admin/departments", {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       setDepartments(res.data);
// //     } catch (err) {
// //       setError("Failed to load departments.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchDepartments();
// //   }, []);

// //   const handleCreate = async (e) => {
// //     e.preventDefault();
// //     try {
// //       const token = localStorage.getItem("adminToken");
// //       await axios.post(
// //         "http://localhost:3700/api/admin/departments",
// //         { name: newName },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       setNewName("");
// //       fetchDepartments();
// //     } catch {
// //       setError("Failed to create department.");
// //     }
// //   };

// //   const handleUpdate = async (e) => {
// //     e.preventDefault();
// //     try {
// //       const token = localStorage.getItem("adminToken");
// //       await axios.put(
// //         `http://localhost:3700/api/admin/departments/${editing.department_id}`,
// //         { name: editName },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       setEditing(null);
// //       setEditName("");
// //       fetchDepartments();
// //     } catch {
// //       setError("Failed to update department.");
// //     }
// //   };

// //   const handleDelete = async (id) => {
// //     if (!window.confirm("Delete this department?")) return;
// //     try {
// //       const token = localStorage.getItem("adminToken");
// //       await axios.delete(
// //         `http://localhost:3700/api/admin/departments/${id}`,
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       fetchDepartments();
// //     } catch {
// //       setError("Failed to delete department.");
// //     }
// //   };

// //   if (loading) return <div>Loading...</div>;
// //   if (error) return <div className="text-red-500">{error}</div>;

// //   return (
// //     <div className="p-4">
// //       <h2 className="text-2xl font-bold mb-4">Departments</h2>
// //       {/* Create */}
// //       <form onSubmit={handleCreate} className="mb-4 flex gap-2">
// //         <input
// //           value={newName}
// //           onChange={e => setNewName(e.target.value)}
// //           placeholder="New Department Name"
// //           className="border px-2 py-1 rounded"
// //           required
// //         />
// //         <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded flex items-center">
// //           <PlusCircle size={18} className="mr-1" /> Add
// //         </button>
// //       </form>
// //       {/* List */}
// //       <table className="min-w-full border">
// //         <thead>
// //           <tr className="bg-gray-100">
// //             <th className="py-2 px-4">Name</th>
// //             <th className="py-2 px-4">Actions</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {departments.map((dept) => (
// //             <tr key={dept.department_id} className="border-t">
// //               <td className="py-2 px-4">{dept.name}</td>
// //               <td className="py-2 px-4 flex gap-2">
// //                 <button
// //                   onClick={() => { setEditing(dept); setEditName(dept.name); }}
// //                   className="text-blue-600"
// //                   title="Edit"
// //                 >
// //                   <Edit size={18} />
// //                 </button>
// //                 <button
// //                   onClick={() => handleDelete(dept.department_id)}
// //                   className="text-red-600"
// //                   title="Delete"
// //                 >
// //                   <Trash2 size={18} />
// //                 </button>
// //               </td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>
// //       {/* Edit Modal */}
// //       {editing && (
// //         <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
// //           <form onSubmit={handleUpdate} className="bg-white p-6 rounded shadow">
// //             <h3 className="mb-2 font-semibold">Edit Department</h3>
// //             <input
// //               value={editName}
// //               onChange={e => setEditName(e.target.value)}
// //               className="border px-2 py-1 rounded mb-2 w-full"
// //               required
// //             />
// //             <div className="flex gap-2 justify-end">
// //               <button type="button" onClick={() => setEditing(null)} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
// //               <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
// //             </div>
// //           </form>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
// ----------------------------------------------------
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { PlusCircle, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'; // Import pagination icons

// const AdminDepartmentsPage = () => {
//     const [departments, setDepartments] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [pageError, setPageError] = useState(''); // Page-level error
//     const [newDepartmentName, setNewDepartmentName] = useState('');
//     const [editingDepartment, setEditingDepartment] = useState(null);
//     const [editDepartmentName, setEditDepartmentName] = useState('');
//     const [formError, setFormError] = useState(''); // Form-level error

//     // --- PAGINATION STATE ---
//     const [currentPage, setCurrentPage] = useState(1);
//     const [itemsPerPage] = useState(10); // Fixed to 10 per page
//     const [totalItems, setTotalItems] = useState(0);
//     const [totalPages, setTotalPages] = useState(1);

//     const getAdminToken = () => localStorage.getItem('adminToken');

//     const fetchDepartments = async (page = currentPage, limit = itemsPerPage) => {
//         setLoading(true);
//         setPageError(''); // Clear page-level error
//         try {
//             const token = getAdminToken();
//             if (!token) {
//                 setPageError('Admin not authenticated. Please log in again.');
//                 setLoading(false);
//                 return;
//             }
//             const response = await axios.get(`http://localhost:3700/api/admin/departments?page=${page}&limit=${limit}`, { // Pass page/limit
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             });
//             // FIX HERE: Access the 'departments' array from the response data
//             setDepartments(response.data.departments); 
//             setTotalItems(response.data.totalItems);
//             setTotalPages(response.data.totalPages);
//             setCurrentPage(response.data.currentPage);
//         } catch (err) {
//             console.error('Departments Page: Error fetching departments:', err.response ? err.response.data : err.message);
//             setPageError(err.response?.data?.message || 'Failed to load departments. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchDepartments(currentPage, itemsPerPage); // Fetch data with pagination params
//     }, [currentPage, itemsPerPage]); // Re-fetch when page or itemsPerPage changes

//     const handleCreateDepartment = async (e) => {
//         e.preventDefault();
//         setFormError(''); // Clear form-level error
//         if (!newDepartmentName.trim()) {
//             setFormError('Department name cannot be empty.');
//             return;
//         }
//         try {
//             const token = getAdminToken();
//             const response = await axios.post('http://localhost:3700/api/admin/departments', {
//                 name: newDepartmentName
//             }, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
//             alert(response.data.message); // Keep alert for success confirmation
//             setNewDepartmentName('');
//             fetchDepartments(currentPage, itemsPerPage); // Refresh list
//         } catch (err) {
//             console.error('Error creating department:', err.response ? err.response.data : err.message);
//             setFormError(err.response?.data?.message || 'Failed to create department.'); // Set form error
//         }
//     };

//     const handleUpdateDepartment = async (e) => {
//         e.preventDefault();
//         setFormError(''); // Clear form-level error
//         if (!editDepartmentName.trim()) {
//             setFormError('Department name cannot be empty.');
//             return;
//         }
//         try {
//             const token = getAdminToken();
//             const response = await axios.put(`http://localhost:3700/api/admin/departments/${editingDepartment.department_id}`, {
//                 name: editDepartmentName
//             }, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
//             alert(response.data.message); // Keep alert for success
//             setEditingDepartment(null);
//             setEditDepartmentName('');
//             fetchDepartments(currentPage, itemsPerPage); // Refresh list
//         } catch (err) {
//             console.error('Error updating department:', err.response ? err.response.data : err.message);
//             setFormError(err.response?.data?.message || 'Failed to update department.'); // Set form error
//         }
//     };

//     const handleDeleteDepartment = async (departmentId) => {
//         setPageError(''); // Clear page-level error before delete
//         if (!window.confirm('Are you sure you want to delete this department?')) {
//             return;
//         }
//         try {
//             const token = getAdminToken();
//             const response = await axios.delete(`http://localhost:3700/api/admin/departments/${departmentId}`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             });
//             alert(response.data.message); // Keep alert for success
//             // If deleting from a page where it's the only item, go to previous page
//             if (departments.length === 1 && currentPage > 1) {
//                 setCurrentPage(currentPage - 1);
//             } else {
//                 fetchDepartments(currentPage, itemsPerPage); // Refresh current page
//             }
//         } catch (err) {
//             console.error('Error deleting department:', err.response ? err.response.data : err.message);
//             if (err.response?.status === 409) {
//                 setPageError('Cannot delete department: It still has associated records (e.g., faculties, students, subjects).');
//             } else {
//                 setPageError(err.response?.data?.message || 'Failed to delete department.');
//             }
//         }
//     };

//     // Pagination Handlers
//     const handlePageChange = (newPage) => {
//         if (newPage > 0 && newPage <= totalPages) {
//             setCurrentPage(newPage);
//         }
//     };

//     const getPageNumbers = () => {
//         const maxVisibleButtons = 5;
//         let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
//         let endPage = startPage + maxVisibleButtons - 1;
//         if (endPage > totalPages) {
//             endPage = totalPages;
//             startPage = Math.max(1, endPage - maxVisibleButtons + 1);
//         }
//         const pages = [];
//         for (let i = startPage; i <= endPage; i++) {
//             pages.push(i);
//         }
//         return pages;
//     };


//     if (loading) return <div className="text-center text-xl mt-10">Loading Departments...</div>;
//     // Display page-level error here
//     if (pageError) return <div className="text-center text-red-500 text-xl mt-10">Error: {pageError}</div>;

//     return (
//         <div className="container mx-auto p-4">
//             <h1 className="text-3xl font-bold mb-6 text-center">Manage Departments</h1>

//             {/* Create Department Form */}
//             <form onSubmit={handleCreateDepartment} className="mb-8 p-4 border rounded-lg shadow-sm">
//                 <h2 className="text-xl font-semibold mb-4">Add New Department</h2>
//                 {formError && <div className="text-red-500 text-sm mb-2">{formError}</div>} {/* Display form-level error */}
//                 <div className="flex items-end space-x-2">
//                     <input
//                         type="text"
//                         placeholder="Department Name (e.g., Physics)"
//                         value={newDepartmentName}
//                         onChange={(e) => setNewDepartmentName(e.target.value)}
//                         className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         required
//                     />
//                     <button
//                         type="submit"
//                         className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center"
//                     >
//                         <PlusCircle size={20} className="mr-2" /> Add
//                     </button>
//                 </div>
//             </form>

//             {/* Departments List */}
//             <div className="p-4 border rounded-lg shadow-sm">
//                 <h2 className="text-xl font-semibold mb-4">Existing Departments</h2>
//                 {departments.length === 0 ? (
//                     <p className="text-center text-gray-500">No departments found.</p>
//                 ) : (
//                     <table className="min-w-full bg-white border-collapse">
//                         <thead>
//                             <tr className="bg-gray-100 border-b">
//                                 <th className="py-2 px-4 text-left">Name</th>
//                                 <th className="py-2 px-4 text-left">ID</th>
//                                 <th className="py-2 px-4 text-left">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {departments.map((dept) => (
//                                 <tr key={dept.department_id} className="border-b last:border-b-0 hover:bg-gray-50">
//                                     <td className="py-2 px-4">{dept.name}</td>
//                                     <td className="py-2 px-4 text-xs text-gray-500">{dept.department_id}</td>
//                                     <td className="py-2 px-4 flex space-x-2">
//                                         <button
//                                             onClick={() => { setEditingDepartment(dept); setEditDepartmentName(dept.name); }}
//                                             className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"
//                                             title="Edit"
//                                         >
//                                             <Edit size={18} />
//                                         </button>
//                                         <button
//                                             onClick={() => handleDeleteDepartment(dept.department_id)}
//                                             className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
//                                             title="Delete"
//                                         >
//                                             <Trash2 size={18} />
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 )}
//             </div>

//             {/* Pagination Controls - Simplified and fixed limit to 10 per page */}
//             <div className="flex justify-between items-center mt-4 p-2 border-t pt-4">
//                 <button
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={currentPage === 1}
//                     className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 flex items-center"
//                 >
//                     <ChevronLeft size={16} className="mr-2" /> Previous
//                 </button>
//                 <div className="flex flex-wrap gap-1">
//                     {getPageNumbers().map((page) => (
//                         <button
//                             key={page}
//                             onClick={() => handlePageChange(page)}
//                             className={`px-3 py-1 rounded-lg border ${
//                                 page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
//                             }`}
//                         >
//                             {page}
//                         </button>
//                     ))}
//                 </div>
//                 <span className="text-sm text-gray-700">
//                     Page {currentPage} of {totalPages} (Total {totalItems} items)
//                 </span>
//                 <button
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={currentPage === totalPages}
//                     className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 flex items-center"
//                 >
//                     Next <ChevronRight size={16} className="ml-2" />
//                 </button>
//             </div>

//             {/* Edit Department Modal/Form */}
//             {editingDepartment && (
//                 <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
//                     <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
//                         <h2 className="text-xl font-semibold mb-4">Edit Department</h2>
//                         <form onSubmit={handleUpdateDepartment}>
//                             {formError && <div className="text-red-500 text-sm mb-2">{formError}</div>} {/* Display form error */}
//                             <div className="mb-4">
//                                 <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-2">
//                                     Department Name
//                                 </label>
//                                 <input
//                                     type="text"
//                                     id="editName"
//                                     value={editDepartmentName}
//                                     onChange={(e) => setEditDepartmentName(e.target.value)}
//                                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     required
//                                 />
//                             </div>
//                             <div className="flex justify-end space-x-2">
//                                 <button
//                                     type="button"
//                                     onClick={() => { setEditingDepartment(null); setEditDepartmentName(''); setFormError(''); }} // Clear error on cancel
//                                     className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                                 >
//                                     Save Changes
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AdminDepartmentsPage;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Edit, Trash2, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react'; // Import Search and Filter icons

const AdminDepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState(''); // Page-level error for fetch/delete
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [editDepartmentName, setEditDepartmentName] = useState('');
    const [formError, setFormError] = useState(''); // Form-level error for create/update

    // --- SEARCH/FILTER STATE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterMenuRef = useRef(null); // Ref for filter menu click outside (if needed)

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Fixed to 10 per page
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const getAdminToken = () => localStorage.getItem('adminToken');

    const fetchDepartments = async (page = currentPage, limit = itemsPerPage, search = searchTerm) => {
        setLoading(true);
        setPageError(''); // Clear page-level error
        try {
            const token = getAdminToken();
            if (!token) {
                setPageError('Admin not authenticated. Please log in again.');
                setLoading(false);
                return;
            }
            const response = await axios.get(`http://localhost:3700/api/admin/departments?page=${page}&limit=${limit}&searchTerm=${search}`, { // Pass page/limit/searchTerm
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // FIX HERE: Access the 'departments' array from the response data
            setDepartments(response.data.departments); 
            setTotalItems(response.data.totalItems);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);
        } catch (err) {
            console.error('Departments Page: Error fetching departments:', err.response ? err.response.data : err.message);
            setPageError(err.response?.data?.message || 'Failed to load departments. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments(currentPage, itemsPerPage, searchTerm); // Fetch data with pagination params
    }, [currentPage, itemsPerPage, searchTerm]); // Refetch when page, limit, or search term changes

    // Search and Filter Handlers
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1); // Reset to first page
    };

    // Pagination Handlers
    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const getPageNumbers = () => {
        const maxVisibleButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
        let endPage = startPage + maxVisibleButtons - 1;
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxVisibleButtons + 1);
        }
        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };


    const handleCreateDepartment = async (e) => {
        e.preventDefault();
        setFormError(''); // Clear form-level error
        if (!newDepartmentName.trim()) {
            setFormError('Department name cannot be empty.');
            return;
        }
        try {
            const token = getAdminToken();
            const response = await axios.post('http://localhost:3700/api/admin/departments', {
                name: newDepartmentName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            alert(response.data.message); // Keep alert for success confirmation
            setNewDepartmentName('');
            fetchDepartments(currentPage, itemsPerPage, searchTerm); // Refresh list
        } catch (err) {
            console.error('Error creating department:', err.response ? err.response.data : err.message);
            setFormError(err.response?.data?.message || 'Failed to create department.'); // Set form error
        }
    };

    const handleUpdateDepartment = async (e) => {
        e.preventDefault();
        setFormError(''); // Clear form-level error
        if (!editDepartmentName.trim()) {
            setFormError('Department name cannot be empty.');
            return;
        }
        try {
            const token = getAdminToken();
            const response = await axios.put(`http://localhost:3700/api/admin/departments/${editingDepartment.department_id}`, {
                name: editDepartmentName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            alert(response.data.message); // Keep alert for success
            setEditingDepartment(null);
            setEditDepartmentName('');
            fetchDepartments(currentPage, itemsPerPage, searchTerm); // Refresh list
        } catch (err) {
            console.error('Error updating department:', err.response ? err.response.data : err.message);
            setFormError(err.response?.data?.message || 'Failed to update department.'); // Set form error
        }
    };

    const handleDeleteDepartment = async (departmentId) => {
        setPageError(''); // Clear page-level error before delete
        if (!window.confirm('Are you sure you want to delete this department?')) {
            return;
        }
        try {
            const token = getAdminToken();
            const response = await axios.delete(`http://localhost:3700/api/admin/departments/${departmentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert(response.data.message); // Keep alert for success
            if (departments.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchDepartments(currentPage, itemsPerPage, searchTerm); // Refresh current page
            }
        } catch (err) {
            console.error('Error deleting department:', err.response ? err.response.data : err.message);
            if (err.response?.status === 409) {
                setPageError('Cannot delete department: It still has associated records (e.g., faculties, students, subjects).');
            } else {
                setPageError(err.response?.data?.message || 'Failed to delete department.');
            }
        }
    };


    if (loading) return <div className="text-center text-xl mt-10">Loading Departments...</div>;
    if (pageError) return <div className="text-center text-red-500 text-xl mt-10">Error: {pageError}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Manage Departments (Branches)</h1>

            {/* Header Section with Search Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-xl font-semibold text-gray-800">Department List</h3>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <div className="relative flex-grow">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search size={20} className="text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by department name..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {searchTerm && ( // Show clear button only if search term exists
                        <button onClick={handleClearSearch} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Clear Search</button>
                    )}
                    <button onClick={handleCreateDepartment} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm flex items-center">
                        <PlusCircle size={20} className="mr-2" /> Add Department
                    </button>
                </div>
            </div>

            {/* Create Department Form */}
            <form onSubmit={handleCreateDepartment} className="mb-8 p-4 border rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Add New Department (Branch)</h2>
                {formError && <div className="text-red-500 text-sm mb-2">{formError}</div>}
                <div className="flex items-end space-x-2">
                    <input
                        type="text"
                        placeholder="Department Name (e.g., Physics)"
                        value={newDepartmentName}
                        onChange={(e) => setNewDepartmentName(e.target.value)}
                        className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center"
                    >
                        <PlusCircle size={20} className="mr-2" /> Add
                    </button>
                </div>
            </form>

            {/* Departments List */}
            <div className="p-4 border rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Existing Departments (Branches)</h2>
                {departments.length === 0 ? (
                    <p className="text-center text-gray-500">No departments found.</p>
                ) : (
                    <table className="min-w-full bg-white border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="py-2 px-4 text-left">Name</th>
                                <th className="py-2 px-4 text-left">ID</th>
                                <th className="py-2 px-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((dept) => (
                                <tr key={dept.department_id} className="border-b last:border-b-0 hover:bg-gray-50">
                                    <td className="py-2 px-4">{dept.name}</td>
                                    <td className="py-2 px-4 text-xs text-gray-500">{dept.department_id}</td>
                                    <td className="py-2 px-4 flex space-x-2">
                                        <button
                                            onClick={() => { setEditingDepartment(dept); setEditDepartmentName(dept.name); setFormError(''); }}
                                            className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDepartment(dept.department_id)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls - Simplified and fixed limit to 10 per page */}
            <div className="flex justify-between items-center mt-4 p-2 border-t pt-4">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 flex items-center"
                >
                    <ChevronLeft size={16} className="mr-2" /> Previous
                </button>
                <div className="flex flex-wrap gap-1">
                    {getPageNumbers().map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-lg border ${
                                page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
                <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages} (Total {totalItems} items)
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 flex items-center"
                >
                    Next <ChevronRight size={16} className="ml-2" />
                </button>
            </div>

            {/* Edit Department Modal/Form */}
            {editingDepartment && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                        <h2 className="text-xl font-semibold mb-4">Edit Department</h2>
                        <form onSubmit={handleUpdateDepartment}>
                            {formError && <div className="text-red-500 text-sm mb-2">{formError}</div>} {/* Display form error */}
                            <div className="mb-4">
                                <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Department Name
                                </label>
                                <input
                                    type="text"
                                    id="editName"
                                    value={editDepartmentName}
                                    onChange={(e) => setEditDepartmentName(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => { setEditingDepartment(null); setEditDepartmentName(''); setFormError(''); }} // Clear error on cancel
                                    className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDepartmentsPage;