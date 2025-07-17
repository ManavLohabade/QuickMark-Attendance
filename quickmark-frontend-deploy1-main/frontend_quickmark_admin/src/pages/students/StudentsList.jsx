// src/pages/students/StudentsList.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Filter, Upload, Printer, Calendar as CalendarIcon } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import Calendar from '../subjects/Calendar.jsx';

export default function StudentsList({ 
  students, 
  onAdd, 
  onEdit, 
  onDelete,
  pagination = { page: 1, totalPages: 1, totalItems: 0 },
  onPageChange,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterYear, setFilterYear] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const filterMenuRef = useRef(null);
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

  const uniqueYears = useMemo(() => [...new Set(students.filter(s => s.current_year).map(s => s.current_year).sort())], [students]);
  const uniqueDepartments = useMemo(() => [...new Set(students.filter(s => s.department_name).map(s => s.department_name).sort())], [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const searchMatch =
        (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.roll_number || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const yearMatch = filterYear ? (student.current_year || '').toString() === filterYear : true;
      const departmentMatch = filterDepartment ? student.department_name === filterDepartment : true;
      
      return searchMatch && yearMatch && departmentMatch;
    });
  }, [students, searchTerm, filterYear, filterDepartment]);
  
  const handlePrint = () => {
      const printContent = printableContentRef.current.innerHTML;
      const printWindow = window.open('', '', 'height=800,width=800');
      
      printWindow.document.write('<html><head><title>Student List</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
          body { font-family: sans-serif; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          h1 { text-align: center; }
          .no-students { text-align: center; padding: 20px; font-style: italic; }
          /* --- FIX: This class will hide the Actions column when printing --- */
          .no-print { display: none; }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write('<h1>Student List</h1>');
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
          alert(`Importing students from ${file.name}...`);
      }
  };

  const handleCalendarClick = (student) => {
    setSelectedStudent(student);
    setIsCalendarOpen(true);
  };

  const handleCloseCalendar = () => {
    setIsCalendarOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {isCalendarOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <Calendar
            subject={null}
            student={selectedStudent}
            onBack={handleCloseCalendar}
          />
        </div>
      )}
      <div className="p-4 sm:p-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="text-xl font-semibold text-gray-800">Student List</h3>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileImport} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
            <button onClick={handleImportClick} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50"><Upload size={16}/> Import</button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50"><Printer size={16}/> Print</button>
            <div className="relative" ref={filterMenuRef}>
              <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="p-2 border rounded-lg hover:bg-gray-50"><Filter size={20} className="text-gray-600"/></button>
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl p-4 z-20 border">
                  <h4 className="font-semibold mb-2">Filter Options</h4>
                  <div className="mb-4"><label className="block text-sm mb-1">Start Year</label><select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="w-full p-2 border rounded-md"><option value="">All</option>{uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                  <div><label className="block text-sm mb-1">Department</label><select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} className="w-full p-2 border rounded-md"><option value="">All</option>{uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                </div>
              )}
            </div>
            <button onClick={onAdd} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm font-semibold">Add Student</button>
          </div>
        </div>
         <div className="relative flex-grow mb-4">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg></span>
              <input type="text" placeholder="Search by name or roll no..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
        
        <div className="overflow-x-auto" ref={printableContentRef}>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Roll No.</th>
                <th className="py-2 px-4">Start Year</th>
                <th className="py-2 px-4">Department</th>
                <th className="py-2 px-4 text-center">Calendar</th>
                {/* --- FIX: Add no-print class to Actions header --- */}
                <th className="py-2 px-4 text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.student_id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{student.name}</td>
                  <td className="py-3 px-4">{student.roll_number}</td>
                  <td className="py-3 px-4">{student.current_year}</td>
                  <td className="py-3 px-4">{student.department_name}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center p-2 rounded hover:bg-gray-100"
                      title="View Attendance Calendar"
                      onClick={() => handleCalendarClick(student)}
                    >
                      <CalendarIcon size={18} className="text-blue-600" />
                    </button>
                  </td>
                  {/* --- FIX: Add no-print class to Actions cell --- */}
                  <td className="py-3 px-4 text-right no-print">
                     <button onClick={() => onEdit(student)} className="text-blue-500 hover:underline font-semibold text-sm mr-4">Edit</button>
                     <button onClick={() => onDelete(student.student_id)} className="text-red-500 hover:underline font-semibold text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {filteredStudents.length === 0 && <div className="text-center py-10 no-students"><p className="text-gray-500">No students found.</p></div>}
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
  )
}