
import React, { useState } from 'react';
import FaceStudentDetailModal from '../face/FaceStudentDetailModal';
import FaceDegreeSelection from '../face/FaceDegreeSelection';
import FaceDepartmentSelection from '../face/FaceDepartmentSelection';
import FaceYearSectionModal from '../face/FaceYearSectionModal';

// Mock data for students
const mockStudents = [
  {
    student_id: '1',
    name: 'Alice Smith',
    rollNo: 'BTECE001',
    facePhoto: 'https://randomuser.me/api/portraits/women/1.jpg',
    lastUpdated: '2024-07-19 02:00',
    degree: 'B.Tech',
    department: 'ECE',
    year: '3',
    section: 'A',
  },
  {
    student_id: '2',
    name: 'Bob Johnson',
    rollNo: 'BTECE002',
    facePhoto: 'https://randomuser.me/api/portraits/men/2.jpg',
    lastUpdated: '2024-07-19 01:50',
    degree: 'B.Tech',
    department: 'ECE',
    year: '3',
    section: 'A',
  },
  {
    student_id: '3',
    name: 'Carol Lee',
    rollNo: 'BTECE003',
    facePhoto: 'https://randomuser.me/api/portraits/women/3.jpg',
    lastUpdated: '2024-07-18 23:30',
    degree: 'B.Tech',
    department: 'IT',
    year: '2',
    section: 'B',
  },
  // ...add more mock students as needed
];

const mockDegrees = ['B.Tech', 'M.Tech', 'MBA', 'PhD'];
const mockDepartments = ['ECE', 'IT', 'CSE', 'HR', 'Finance', 'VLSI', 'Power Systems', 'Research'];
const mockYears = ['1', '2', '3', '4'];
const mockSections = ['A', 'B', 'C'];
const PAGE_SIZE = 8;

export default function FaceRegister() {
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'browse'
  // Dashboard state
  const [search, setSearch] = useState('');
  const [degree, setDegree] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [page, setPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  // Browse by state
  const [browseStep, setBrowseStep] = useState('degree');
  const [browseDegree, setBrowseDegree] = useState(null);
  const [browseDepartment, setBrowseDepartment] = useState(null);
  const [browseYearSection, setBrowseYearSection] = useState(null);
  const [yearSectionModalOpen, setYearSectionModalOpen] = useState(false);

  // Dashboard filter logic
  const filtered = mockStudents
    .filter(s =>
      (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.toLowerCase().includes(search.toLowerCase())) &&
      (!degree || s.degree === degree) &&
      (!department || s.department === department) &&
      (!year || s.year === year) &&
      (!section || s.section === section)
    )
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const students = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Browse by logic
  let browseStudents = mockStudents;
  if (browseDegree) browseStudents = browseStudents.filter(s => s.degree === browseDegree.name);
  if (browseDepartment) browseStudents = browseStudents.filter(s => s.department === browseDepartment.name);
  if (browseYearSection) {
    browseStudents = browseStudents.filter(s => s.year === browseYearSection.year && s.section === browseYearSection.section);
  }
  browseStudents = browseStudents.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

  // Handlers for browse by
  const handleBrowseSelectDegree = (degree) => {
    setBrowseDegree(degree);
    setBrowseStep('department');
  };
  const handleBrowseSelectDepartment = (dept) => {
    setBrowseDepartment(dept);
    setYearSectionModalOpen(true);
  };
  const handleBrowseYearSectionSubmit = ({ year, section }) => {
    setBrowseYearSection({ year, section });
    setYearSectionModalOpen(false);
    setBrowseStep('students');
  };
  const handleBrowseBackToDegree = () => {
    setBrowseStep('degree');
    setBrowseDegree(null);
    setBrowseDepartment(null);
    setBrowseYearSection(null);
  };
  const handleBrowseBackToDepartment = () => {
    setBrowseStep('department');
    setBrowseDepartment(null);
    setBrowseYearSection(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Face Registration</h1>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg font-semibold ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setView('dashboard')}
            >Dashboard</button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold ${view === 'browse' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setView('browse')}
            >Browse by Cards</button>
          </div>
        </div>
        {view === 'dashboard' && (
          <>
            {/* Search & Filter Bar */}
            <div className="flex flex-wrap gap-4 justify-center items-center mb-8 bg-white p-4 rounded-lg shadow">
              <input
                type="text"
                placeholder="Search by name or roll no..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="p-2 border rounded w-64 focus:ring-2 focus:ring-blue-400"
              />
              <select value={degree} onChange={e => { setDegree(e.target.value); setPage(1); }} className="p-2 border rounded">
                <option value="">All Degrees</option>
                {mockDegrees.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={department} onChange={e => { setDepartment(e.target.value); setPage(1); }} className="p-2 border rounded">
                <option value="">All Departments</option>
                {mockDepartments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={year} onChange={e => { setYear(e.target.value); setPage(1); }} className="p-2 border rounded">
                <option value="">All Years</option>
                {mockYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={section} onChange={e => { setSection(e.target.value); setPage(1); }} className="p-2 border rounded">
                <option value="">All Sections</option>
                {mockSections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {/* Student Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {students.map(student => (
                <button
                  key={student.student_id}
                  onClick={() => setSelectedStudent(student)}
                  className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center hover:shadow-xl hover:bg-blue-50 transition group"
                >
                  <img src={student.facePhoto} alt={student.name} className="w-24 h-24 object-cover rounded-full mb-3 border-4 border-blue-200 group-hover:border-blue-400 transition" />
                  <span className="font-semibold text-lg mb-1 text-gray-800 group-hover:text-blue-700">{student.name}</span>
                  <span className="text-gray-600 text-sm mb-1">{student.rollNo}</span>
                  <span className="text-xs text-gray-500">{student.degree} | {student.department} | Year {student.year} {student.section}</span>
                  <span className="text-xs text-green-600 mt-1">Last updated: {student.lastUpdated}</span>
                </button>
              ))}
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >Next</button>
            </div>
          </>
        )}
        {view === 'browse' && (
          <div>
            {browseStep === 'degree' && (
              <FaceDegreeSelection onSelectDegree={handleBrowseSelectDegree} />
            )}
            {browseStep === 'department' && browseDegree && (
              <>
                <button onClick={handleBrowseBackToDegree} className="ml-6 mt-4 text-blue-600 hover:underline">&larr; Back to Degrees</button>
                <FaceDepartmentSelection degree={browseDegree} onSelectDepartment={handleBrowseSelectDepartment} />
              </>
            )}
            {yearSectionModalOpen && (
              <FaceYearSectionModal
                isOpen={yearSectionModalOpen}
                onClose={() => setYearSectionModalOpen(false)}
                onSubmit={handleBrowseYearSectionSubmit}
              />
            )}
            {browseStep === 'students' && browseDepartment && browseYearSection && (
              <div className="container mx-auto p-6">
                <button onClick={handleBrowseBackToDepartment} className="ml-6 mt-4 text-blue-600 hover:underline">&larr; Back to Departments</button>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-4">
                  {browseStudents.map(student => (
                    <button
                      key={student.student_id}
                      onClick={() => setSelectedStudent(student)}
                      className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center hover:shadow-xl hover:bg-blue-50 transition group"
                    >
                      <img src={student.facePhoto} alt={student.name} className="w-24 h-24 object-cover rounded-full mb-3 border-4 border-blue-200 group-hover:border-blue-400 transition" />
                      <span className="font-semibold text-lg mb-1 text-gray-800 group-hover:text-blue-700">{student.name}</span>
                      <span className="text-gray-600 text-sm mb-1">{student.rollNo}</span>
                      <span className="text-xs text-gray-500">{student.degree} | {student.department} | Year {student.year} {student.section}</span>
                      <span className="text-xs text-green-600 mt-1">Last updated: {student.lastUpdated}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <FaceStudentDetailModal
          student={selectedStudent}
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      </div>
    </div>
  );
}