// src/pages/faculty/FacultyList.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
// --- 1. IMPORT: Add Printer and Upload icons ---
import { Filter, Printer, Upload, BookOpen } from 'lucide-react';
import AddEditFacultyModal from './AddEditFacultyModal.jsx';
import SubjectAssignmentModal from './SubjectAssignmentModal.jsx';
import Pagination from '../../components/common/Pagination';

export default function FacultyList({ 
  faculty, 
  onAddFaculty, 
  onUpdateFaculty, 
  onDeleteFaculty,
  pagination = { page: 1, totalPages: 1, totalItems: 0 },
  onPageChange,
  allDepartments = [],
  allSubjects = [],
  onAssignSubjectToFaculty,
  onRemoveSubjectFromFaculty,
  onGetFacultyAssignments,
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubjectAssignmentModalOpen, setIsSubjectAssignmentModalOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [selectedFacultyForAssignment, setSelectedFacultyForAssignment] = useState(null);
    const [facultyAssignments, setFacultyAssignments] = useState([]);
    
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterDesignation, setFilterDesignation] = useState('');

    const filterMenuRef = useRef(null);
    // --- 2. CREATE REFS: Add refs for the file input and printable area ---
    const fileInputRef = useRef(null);
    const printableContentRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const uniqueDepartments = useMemo(() => [...new Set(faculty.filter(f => f.department_name).map(f => f.department_name))], [faculty]);
    const uniqueDesignations = useMemo(() => [...new Set(faculty.filter(f => f.designation).map(f => f.designation || 'Faculty'))], [faculty]);

    const filteredFaculty = useMemo(() => {
        return faculty.filter(f => {
            const searchMatch = (f.name || '').toLowerCase().includes(searchTerm.toLowerCase());
            const departmentMatch = filterDepartment ? f.department_name === filterDepartment : true;
            const designationMatch = filterDesignation ? (f.designation || 'Faculty') === filterDesignation : true;
            return searchMatch && departmentMatch && designationMatch;
        });
    }, [faculty, searchTerm, filterDepartment, filterDesignation]);
    
    const handleSave = async (formData) => {
        try {
            if (editingFaculty) {
                await onUpdateFaculty(editingFaculty.faculty_id, formData);
            } else {
                await onAddFaculty(formData);
            }
            handleCloseModal();
        } catch (error) {
            // Keep modal open if there's an error
            console.error('Error saving faculty:', error);
        }
    };

    // --- 3. ADD HANDLERS: Create handlers for print and import functionality ---
    const handlePrint = () => {
        const printContent = printableContentRef.current.innerHTML;
        const printWindow = window.open('', '', 'height=800,width=800');
        
        printWindow.document.write('<html><head><title>Faculty List</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
            body { font-family: sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { text-align: center; }
            .no-print { display: none; }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write('<h1>Faculty List</h1>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileImport = (e) => {
        const file = e.target.files[0];
        if (file) {
            alert(`Importing faculty from ${file.name}...`);
        }
    };

    const handleAddClick = () => {
        setEditingFaculty(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (facultyMember) => {
        setEditingFaculty(facultyMember);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFaculty(null);
    };

    const handleAssignSubjectsClick = async (facultyMember) => {
        setSelectedFacultyForAssignment(facultyMember);
        try {
            // Fetch current assignments for this faculty
            const assignments = await onGetFacultyAssignments(facultyMember.faculty_id);
            setFacultyAssignments(assignments.assignments || []);
            setIsSubjectAssignmentModalOpen(true);
        } catch (error) {
            console.error('Error fetching faculty assignments:', error);
            setFacultyAssignments([]);
            setIsSubjectAssignmentModalOpen(true);
        }
    };

    const handleCloseSubjectAssignmentModal = () => {
        setIsSubjectAssignmentModalOpen(false);
        setSelectedFacultyForAssignment(null);
        setFacultyAssignments([]);
    };

    const handleAssignSubject = async (facultyId, subjectId) => {
        try {
            await onAssignSubjectToFaculty(facultyId, subjectId);
            // Refresh assignments
            const assignments = await onGetFacultyAssignments(facultyId);
            setFacultyAssignments(assignments.assignments || []);
        } catch (error) {
            throw error;
        }
    };

    const handleRemoveSubject = async (facultyId, subjectId) => {
        try {
            await onRemoveSubjectFromFaculty(facultyId, subjectId);
            // Refresh assignments
            const assignments = await onGetFacultyAssignments(facultyId);
            setFacultyAssignments(assignments.assignments || []);
        } catch (error) {
            throw error;
        }
    };

    return (
        <>
            {isModalOpen && <AddEditFacultyModal facultyMember={editingFaculty} onClose={handleCloseModal} onSave={handleSave} allDepartments={allDepartments} />}
            {isSubjectAssignmentModalOpen && (
                <SubjectAssignmentModal
                    faculty={selectedFacultyForAssignment}
                    allSubjects={allSubjects}
                    currentAssignments={facultyAssignments}
                    onClose={handleCloseSubjectAssignmentModal}
                    onAssignSubject={handleAssignSubject}
                    onRemoveSubject={handleRemoveSubject}
                />
            )}

            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="text-xl font-semibold text-gray-800">Faculty</h3>
                        <div className="flex items-center space-x-2 w-full md:w-auto">
                            {/* --- 4. RENDER BUTTONS: Add the Import/Print buttons and hidden file input --- */}
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileImport} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                            <button onClick={handleImportClick} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50"><Upload size={16}/> Import</button>
                            <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50"><Printer size={16}/> Print</button>
                            
                            <div className="relative flex-grow">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg></span>
                                <input type="text" placeholder="Search by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="relative" ref={filterMenuRef}>
                                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><Filter size={20} className="text-gray-600"/></button>
                                {isFilterOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl p-4 z-20 border">
                                        <h4 className="font-semibold mb-2">Filter Options</h4>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                            <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} className="w-full p-2 border rounded-md text-sm"><option value="">All</option>{uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}</select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                            <select value={filterDesignation} onChange={e => setFilterDesignation(e.target.value)} className="w-full p-2 border rounded-md text-sm"><option value="">All</option>{uniqueDesignations.map(d => <option key={d} value={d}>{d}</option>)}</select>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button onClick={handleAddClick} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm">Add Faculty</button>
                        </div>
                    </div>

                    {/* --- 5. ATTACH REF: Attach the ref to the div wrapping the table --- */}
                    <div className="overflow-x-auto" ref={printableContentRef}>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2 px-4">Name</th>
                                    <th className="py-2 px-4">Department</th>
                                    <th className="py-2 px-4">Designation</th>
                                    <th className="py-2 px-4 text-right no-print">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFaculty.map((f) => (
                                    <tr key={f.faculty_id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium">{f.name}</td>
                                        <td className="py-3 px-4">{f.department_name}</td>
                                        <td className="py-3 px-4">{f.designation || 'Faculty'}</td>
                                        <td className="py-3 px-4 text-right no-print">
                                            <button onClick={() => handleAssignSubjectsClick(f)} className="text-green-500 hover:underline font-semibold text-sm mr-4 flex items-center gap-1">
                                                <BookOpen size={14} />
                                                Assign Subjects
                                            </button>
                                            <button onClick={() => handleEditClick(f)} className="text-blue-500 hover:underline font-semibold text-sm mr-4">Edit</button>
                                            <button onClick={() => onDeleteFaculty(f.faculty_id)} className="text-red-500 hover:underline font-semibold text-sm">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {filteredFaculty.length === 0 && <div className="text-center py-10"><p className="text-gray-500">No faculty found.</p></div>}
                    </div>
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