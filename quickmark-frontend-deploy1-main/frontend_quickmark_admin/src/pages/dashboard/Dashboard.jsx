// src/pages/dashboard/Dashboard.jsx
import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChevronLeft, ChevronRight, BookOpen, Users, AlertTriangle, GraduationCap, Building, Settings, Activity, Camera, X, UserPlus } from "lucide-react";
import InfoCard from "./InfoCard.jsx";

const ITEMS_PER_PAGE = 5;

export default function Dashboard({ allStudents, allSubjects, allFaculty, allDepartments, dashboardStats, navigateTo }) {
  const [filters, setFilters] = useState({ year: "", department: "", faculty: "" });
  const [currentPage, setCurrentPage] = useState(0);

  // Calculate stats from props or use dashboardStats if available
  const stats = useMemo(() => {
    if (dashboardStats && Object.keys(dashboardStats).length > 0) {
      return dashboardStats;
    }
    
    // Fallback to calculating from props
    return {
      departments: allDepartments?.length || 0,
      faculties: allFaculty?.length || 0,
      students: allStudents?.length || 0,
      subjects: allSubjects?.length || 0,
      defaulters: allStudents?.filter(s => s.attendance < 75).length || 0,
    };
  }, [dashboardStats, allDepartments, allFaculty, allStudents, allSubjects]);

  const chartData = useMemo(() => {
    if (!allStudents || !allSubjects) return [];
    
    const defaultersBySubject = allSubjects.map((subject) => {
      // Get subject properties with fallbacks
      const subjectYear = subject.startYear || subject.year || subject.current_year || subject.academic_year;
      const subjectDepartment = subject.department || subject.department_name || subject.department_id;
      const subjectFaculty = subject.faculty || subject.faculty_name || subject.faculty_id || subject.instructor;
      
      // Filter students by department and year
      const studentsInSubject = allStudents.filter((student) => {
        const studentDepartment = student.department || student.department_name || student.department_id;
        const studentYear = student.startYear || student.year || student.current_year || student.academic_year;
        
        return studentDepartment === subjectDepartment && studentYear === subjectYear;
      });
      
      // Count defaulters (students with attendance < 75)
      const defaulterCount = studentsInSubject.filter((student) => {
        const attendance = student.attendance || student.attendance_percentage || 0;
        return attendance < 75;
      }).length;
      
      return { 
        ...subject, 
        defaulters: defaulterCount,
        year: subjectYear,
        department: subjectDepartment,
        faculty: subjectFaculty
      };
    });

    return defaultersBySubject.filter((subject) => {
      const yearMatch = filters.year ? subject.year?.toString() === filters.year : true;
      const departmentMatch = filters.department ? subject.department === filters.department : true;
      const facultyMatch = filters.faculty ? subject.faculty === filters.faculty : true;
      return yearMatch && departmentMatch && facultyMatch;
    });
  }, [allStudents, allSubjects, filters]);

  const paginatedData = useMemo(() => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    return chartData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [chartData, currentPage]);

  const totalPages = Math.ceil(chartData.length / ITEMS_PER_PAGE);
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setFilters({ year: "", department: "", faculty: "" });
    setCurrentPage(0);
  };
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

  // Get unique values for dropdowns with fallbacks for different data structures
  const uniqueYears = useMemo(() => {
    if (!allSubjects || allSubjects.length === 0) return [];
    
    const years = allSubjects
      .map((s) => s.startYear || s.year || s.current_year || s.academic_year)
      .filter(Boolean)
      .sort((a, b) => a - b);
    
    return [...new Set(years)];
  }, [allSubjects]);

  const uniqueDepartments = useMemo(() => {
    if (!allSubjects || allSubjects.length === 0) return [];
    
    const departments = allSubjects
      .map((s) => s.department || s.department_name || s.department_id)
      .filter(Boolean)
      .sort();
    
    return [...new Set(departments)];
  }, [allSubjects]);

  const uniqueFaculty = useMemo(() => {
    if (!allSubjects || allSubjects.length === 0) return [];
    
    const faculty = allSubjects
      .map((s) => s.faculty || s.faculty_name || s.faculty_id || s.instructor)
      .filter(Boolean)
      .sort();
    
    return [...new Set(faculty)];
  }, [allSubjects]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <InfoCard
          title="Total Degrees"
          value={stats.degrees || 0}
          navigate={navigateTo}
          linkTo="Degree"
          IconComponent={GraduationCap}
        />
        <InfoCard
          title="Total Departments"
          value={stats.departments}
          navigate={navigateTo}
          linkTo="Departments"
          IconComponent={Building}
        />
        <InfoCard
          title="Total Faculty"
          value={stats.faculties}
          navigate={navigateTo}
          linkTo="Faculty"
          IconComponent={GraduationCap}
        />
        <InfoCard
          title="Total Subjects"
          value={stats.subjects}
          navigate={navigateTo}
          linkTo="Subjects"
          IconComponent={BookOpen}
        />
        <InfoCard
          title="Total Students"
          value={stats.students}
          navigate={navigateTo}
          linkTo="Students"
          IconComponent={Users}
        />
        {/* Core Enrollments card inserted here */}
        <InfoCard
          title="Enrollments"
          value=""
          navigate={navigateTo}
          linkTo="CoreEnrollments"
          IconComponent={UserPlus}
        />
        <InfoCard
          title="Total Defaulters"
          value={stats.defaulters}
          navigate={navigateTo}
          linkTo="Defaulters"
          IconComponent={AlertTriangle}
        />
        <InfoCard
          title="Activity Log"
          value=""
          navigate={navigateTo}
          linkTo="AdminActivityLog"
          IconComponent={Activity}
        />
        <InfoCard
          title="Faculty Management"
          value=""
          navigate={navigateTo}
          linkTo="FacultyManagement"
          IconComponent={Users}
        />
        <InfoCard
          title="Face Register"
          value=""
          navigate={navigateTo}
          linkTo="FaceRegister"
          IconComponent={Camera}
        />
        <InfoCard
          title="Settings"
          value=""
          navigate={navigateTo}
          linkTo="Settings"
          IconComponent={Settings}
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Defaulters Analysis by Subject</h2>
        
        {allSubjects && allSubjects.length > 0 ? (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                {(filters.year || filters.department || filters.faculty) && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <X size={16} />
                    Clear Filters
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Year</label>
                  <select 
                    name="year" 
                    value={filters.year} 
                    onChange={handleFilterChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                <option value="">All Years</option>
                    {uniqueYears.map((y, index) => (
                      <option key={`year-${index}`} value={y}>
                        {y}
                      </option>
                    ))}
              </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Department</label>
                  <select 
                    name="department" 
                    value={filters.department} 
                    onChange={handleFilterChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                <option value="">All Departments</option>
                    {uniqueDepartments.map((d, index) => (
                      <option key={`dept-${index}`} value={d}>
                        {d}
                      </option>
                    ))}
              </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Faculty</label>
                  <select 
                    name="faculty" 
                    value={filters.faculty} 
                    onChange={handleFilterChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                <option value="">All Faculty</option>
                    {uniqueFaculty.map((f, index) => (
                      <option key={`faculty-${index}`} value={f}>
                        {f}
                      </option>
                    ))}
              </select>
                </div>
              </div>
            </div>

            <div style={{ width: "100%", height: 400 }}>
              <ResponsiveContainer>
                <BarChart data={paginatedData} margin={{ top: 20, right: 30, left: 20, bottom: 75 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" type="category" angle={0} textAnchor="middle" interval={0} tick={{ fontSize: 12 }} />
                  <YAxis type="number" allowDecimals={false} dataKey="defaulters" />
                  <Tooltip />
                  <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }}/>
                  <Bar dataKey="defaulters" fill="#EF4444" name="Defaulters"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-end items-center mt-4">
              <span className="text-sm text-gray-600 mr-4">Page {currentPage + 1} of {totalPages > 0 ? totalPages : 1}</span>
              <button onClick={goToPrevPage} disabled={currentPage === 0} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={20} /></button>
              <button onClick={goToNextPage} disabled={currentPage >= totalPages - 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={20} /></button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p>No subjects available to display chart</p>
          </div>
        )}
      </div>
    </div>
  );
}