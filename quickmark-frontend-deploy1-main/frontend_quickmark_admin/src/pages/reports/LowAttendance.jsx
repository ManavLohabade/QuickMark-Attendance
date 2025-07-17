// src/pages/reports/LowAttendance.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Filter, Search, Bell, Printer } from 'lucide-react';

export default function LowAttendance({ allStudents }) {
  // We first get the list of defaulters
  const defaulters = useMemo(() => allStudents.filter(s => s.attendance < 75), [allStudents]);
  
  // State for UI controls
  const [searchTerm, setSearchTerm] = useState('');
  // --- BUG FIX: Changed initial state to align with startYear ---
  const [filterYear, setFilterYear] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterMenuRef = useRef(null);
  const printableContentRef = useRef(null);

  const handlePrint = () => {
    const printContent = printableContentRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=800,width=800');

    printWindow.document.write('<html><head><title>Defaulters List</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
        body { font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        h1 { text-align: center; }
        .attendance-low { color: #DC2626; font-weight: bold; }
        /* --- BUG FIX: Added .no-print class to hide checkboxes --- */
        .no-print { display: none; }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<h1>Defaulters List (< 75% Attendance)</h1>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterMenuRef]);

  // --- BUG FIX: Changed .year to .startYear ---
  const uniqueYears = useMemo(() => [...new Set(defaulters.map(s => s.startYear))], [defaulters]);
  const uniqueDepartments = useMemo(() => [...new Set(defaulters.map(s => s.department))], [defaulters]);

  const filteredList = useMemo(() => {
    return defaulters.filter(student => {
      const searchMatch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
      
      // --- BUG FIX: Changed .year to .startYear ---
      const yearMatch = filterYear ? student.startYear.toString() === filterYear : true;
      const departmentMatch = filterDepartment ? student.department === filterDepartment : true;
      
      return searchMatch && yearMatch && departmentMatch;
    });
  }, [defaulters, searchTerm, filterYear, filterDepartment]);

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredList.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSendAlerts = () => {
    if (selectedStudents.length === 0) return;
    console.log("Sending alerts to student IDs:", selectedStudents);
    alert(`Alerts sent to ${selectedStudents.length} student(s).`);
    setSelectedStudents([]);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      {/* --- UI IMPROVEMENT: Refactored header for better layout --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h3 className="text-xl font-semibold text-gray-800 self-start md:self-center">Low Attendance Students</h3>
        <div className="flex items-center space-x-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Search size={20} className="text-gray-400" /></span>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            {/* Filter Button */}
            <div className="relative" ref={filterMenuRef}>
                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="p-2 border rounded-lg hover:bg-gray-50"><Filter size={20} className="text-gray-600"/></button>
                {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl p-4 z-20 border">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="w-full p-2 border rounded-md"><option value="">All Years</option>{uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}</select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} className="w-full p-2 border rounded-md"><option value="">All Departments</option>{uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}</select>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {/* Action buttons now below the filters */}
      <div className="flex justify-between items-center mb-4">
        <button
            onClick={handleSendAlerts}
            disabled={selectedStudents.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-sm hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
            <Bell size={18} />
            Send Alert ({selectedStudents.length})
        </button>
        <button 
            onClick={handlePrint} 
            className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50"
        >
            <Printer size={16}/> Print List
        </button>
      </div>

      <div className="overflow-x-auto" ref={printableContentRef}>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              {/* --- BUG FIX: Added .no-print to hide checkbox column from print --- */}
              <th className="py-2 px-4 w-12 text-center no-print">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedStudents.length === filteredList.length && filteredList.length > 0}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded"
                />
              </th>
              <th className="py-2 px-4">Student Name</th>
              <th className="py-2 px-4">Roll no.</th>
              <th className="py-2 px-4">Year</th>
              <th className="py-2 px-4">Department</th>
              <th className="py-2 px-4">Attendance Rate</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((student) => (
              <tr key={student.id} className={`border-b hover:bg-gray-50 ${selectedStudents.includes(student.id) ? 'bg-blue-50' : ''}`}>
                {/* --- BUG FIX: Added .no-print to hide checkbox cell from print --- */}
                <td className="py-3 px-4 text-center no-print">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleSelectStudent(student.id)}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                  />
                </td>
                <td className="py-3 px-4 font-medium">{student.name}</td>
                <td className="py-3 px-4">{student.rollNo}</td>
                {/* --- BUG FIX: Changed .year to .startYear --- */}
                <td className="py-3 px-4">{student.startYear}</td>
                <td className="py-3 px-4">{student.department}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${student.attendance}%` }}></div>
                    </div>
                    <span className="font-semibold">{student.attendance}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredList.length === 0 && <div className="text-center py-10"><p className="text-gray-500">No defaulters found matching your criteria.</p></div>}
      </div>
    </div>
  );
}