import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AttendanceChart from '../components/attendance/AttendanceChart'; // Adjust path if needed

const ITEMS_PER_PAGE = 5; // Show 5 subjects at a time in the chart

const Dashboard = ({ user, subjects, students }) => {
    // --- STATE MANAGEMENT ---
    const [filters, setFilters] = useState({ year: '', department: '' });
    const [currentPage, setCurrentPage] = useState(1);

    // --- DATA PROCESSING & FILTERING ---
    const chartData = useMemo(() => {
        // 1. Filter subjects based on the selected dropdown values
        const filteredSubjects = subjects.filter(subject => {
            return (filters.year ? subject.year == filters.year : true) &&
                   (filters.department ? subject.department === filters.department : true);
        });

        // 2. Process the filtered subjects to calculate low attendance counts
        return filteredSubjects.map(subject => {
            const subjectStudents = students[subject.id] || [];
            const lowAttendanceCount = subjectStudents.filter(s => s.attendance < 75).length;
            return {
                name: subject.name,
                lowAttendance: lowAttendanceCount
            };
        });
    }, [subjects, students, filters]);

    // --- PAGINATION LOGIC ---
    const totalPages = Math.ceil(chartData.length / ITEMS_PER_PAGE);
    const paginatedData = chartData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };
    
    // --- FILTER OPTIONS ---
    // Dynamically get unique years and departments for dropdowns
    const yearOptions = [...new Set(subjects.map(s => s.year))].sort();
    const departmentOptions = [...new Set(subjects.map(s => s.department))].sort();

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1); // Reset to first page on filter change
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-text-primary">Welcome, {user.name}</h2>
                <p className="text-text-secondary mt-1">Here is the low attendance overview for your subjects.</p>
            </div>

            {/* Chart and Controls Container */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Low Attendance Report</h3>
                
                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 pb-6 border-b border-border-color">
                    <div className="flex-1">
                        <label htmlFor="year" className="block text-sm font-medium text-text-secondary mb-1">Year</label>
                        <select name="year" id="year" value={filters.year} onChange={handleFilterChange} className="w-full p-2 border border-border-color rounded-md">
                            <option value="">All Years</option>
                            {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label htmlFor="department" className="block text-sm font-medium text-text-secondary mb-1">Department</label>
                        <select name="department" id="department" value={filters.department} onChange={handleFilterChange} className="w-full p-2 border border-border-color rounded-md">
                            <option value="">All Departments</option>
                            {departmentOptions.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                        </select>
                    </div>
                </div>

                {/* Chart */}
                <AttendanceChart data={paginatedData} />

                {/* Pagination Controls */}
                <div className="flex justify-center items-center mt-4">
                    <button onClick={handlePrevPage} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="mx-4 text-sm font-medium">
                        Page {currentPage} of {totalPages > 0 ? totalPages : 1}
                    </span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
