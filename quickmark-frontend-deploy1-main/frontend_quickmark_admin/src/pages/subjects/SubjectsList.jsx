// src/pages/subjects/SubjectsList.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { List, LayoutGrid, Filter, X } from "lucide-react";
import Pagination from "../../components/common/Pagination";
import axios from "axios";
// import AddEditSubjectModal from "./AddEditSubjectModal.jsx";

// The AddEditSubjectModal component remains unchanged
const AddEditSubjectModal = ({ subject, onClose, onSave, allDepartments, allFaculty }) => {
  const [formData, setFormData] = useState({
    subject_name: subject?.subject_name || "",
    subject_code: subject?.subject_code || "",
    department_id: subject?.department_id || "",
    year: subject?.year || new Date().getFullYear(),
    section: subject?.section || "A",
    semester: subject?.semester ? subject.semester.toString() : "1",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject_name || !formData.subject_code || !formData.department_id || !formData.section || !formData.semester) {
      alert("Please fill out all required fields.");
      return;
    }
    console.log('Submitting subject formData:', formData);
    onSave({
      ...formData,
      year: parseInt(formData.year),
      semester: parseInt(formData.semester),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {subject ? "Edit Subject" : "Add New Subject"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Subject Name *
              </label>
              <input
                type="text"
                name="subject_name"
                value={formData.subject_name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Subject Code *
              </label>
              <input
                type="text"
                name="subject_code"
                value={formData.subject_code}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Department *
              </label>
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Department</option>
                {allDepartments?.map((dept) => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Year *
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="1"
                max="10"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Section *
              </label>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Semester *
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// The main component now accepts `initialDepartmentFilter`
export default function SubjectsList({
  subjects,
  allDepartments, // <-- NEW PROP
  allFaculty,
  onViewDetails,
  onAddSubject,
  onUpdateSubject,
  initialDepartmentFilter = "", // Default to empty
  pagination = { page: 1, totalPages: 1, totalItems: 0 },
  onPageChange,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterYear, setFilterYear] = useState("");
  // UPDATED: The department filter is initialized with the value from the prop
  const [filterDepartment, setFilterDepartment] = useState(
    initialDepartmentFilter
  );
  const [filterSubject, setFilterSubject] = useState("");
  const [filterFaculty, setFilterFaculty] = useState("");
  const filterMenuRef = useRef(null);

  // UPDATED: This effect syncs the internal state if the prop changes.
  // This is crucial for when the user navigates from the Departments page.
  useEffect(() => {
    setFilterDepartment(initialDepartmentFilter || "");
  }, [initialDepartmentFilter]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target)
      ) {
        setIsFilterOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ... (the rest of the component logic is unchanged)
  const uniqueYears = useMemo(
    () => [...new Set(subjects.filter(s => s.year).map((s) => s.year).sort())],
    [subjects]
  );
  const uniqueDepartments = useMemo(
    () => [...new Set(subjects.filter(s => s.department_name).map((s) => s.department_name).sort())],
    [subjects]
  );
  const uniqueSubjects = useMemo(
    () => [...new Set(subjects.filter(s => s.subject_name).map((s) => s.subject_name).sort())],
    [subjects]
  );
  const uniqueFaculty = useMemo(
    () => [...new Set(subjects.filter(s => s.faculty_name).map((s) => s.faculty_name || 'TBD').sort())],
    [subjects]
  );

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const searchMatch =
        (subject.subject_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subject.department_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subject.faculty_name || 'TBD').toLowerCase().includes(searchTerm.toLowerCase());
      const yearMatch = filterYear
        ? (subject.year || '').toString() === filterYear
        : true;
      const departmentMatch = filterDepartment
        ? subject.department_name === filterDepartment
        : true;
      const subjectMatch = filterSubject
        ? subject.subject_name === filterSubject
        : true;
      const facultyMatch = filterFaculty
        ? (subject.faculty_name || 'TBD') === filterFaculty
        : true;
      return (
        searchMatch &&
        yearMatch &&
        departmentMatch &&
        subjectMatch &&
        facultyMatch
      );
    });
  }, [
    subjects,
    searchTerm,
    filterYear,
    filterDepartment,
    filterSubject,
    filterFaculty,
  ]);
  const clearFilters = () => {
    setFilterYear("");
    setFilterDepartment("");
    setFilterSubject("");
    setFilterFaculty("");
  };
  const handleAddClick = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };
  const handleEditClick = (subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };
  const handleSave = async (data) => {
    try {
      console.log('Data being sent to backend:', data);
      if (editingSubject) {
        await onUpdateSubject(editingSubject.subject_id, data);
      } else {
        await onAddSubject(data);
      }
      setIsModalOpen(false);
      setEditingSubject(null);
    } catch (error) {
      // Keep modal open if there's an error
      console.error('Error saving subject:', error);
    }
  };

  return (
    <>
      {isModalOpen && (
        <AddEditSubjectModal
          subject={editingSubject}
          allDepartments={allDepartments}
          allFaculty={allFaculty}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-xl font-semibold text-gray-800">Subjects</h3>
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative" ref={filterMenuRef}>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter size={20} className="text-gray-600" />
                </button>
                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl p-4 z-20 border">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">Filter Options</h4>
                      <button
                        onClick={clearFilters}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Year
                        </label>
                        <select
                          value={filterYear}
                          onChange={(e) => setFilterYear(e.target.value)}
                          className="w-full p-2 border rounded-md text-sm"
                        >
                          <option value="">All</option>
                          {uniqueYears.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department
                        </label>
                        <select
                          value={filterDepartment}
                          onChange={(e) => setFilterDepartment(e.target.value)}
                          className="w-full p-2 border rounded-md text-sm"
                        >
                          <option value="">All</option>
                          {uniqueDepartments.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject
                        </label>
                        <select
                          value={filterSubject}
                          onChange={(e) => setFilterSubject(e.target.value)}
                          className="w-full p-2 border rounded-md text-sm"
                        >
                          <option value="">All</option>
                          {uniqueSubjects.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Faculty
                        </label>
                        <select
                          value={filterFaculty}
                          onChange={(e) => setFilterFaculty(e.target.value)}
                          className="w-full p-2 border rounded-md text-sm"
                        >
                          <option value="">All</option>
                          {uniqueFaculty.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleAddClick}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm font-semibold"
              >
                Add Subject
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-2 px-4">Subject Name</th>
                  <th className="py-2 px-4">Department</th>
                  <th className="py-2 px-4">Faculty</th>
                  <th className="py-2 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((subject) => (
                  <tr
                    key={subject.subject_id}
                    className="border-b text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => onViewDetails(subject)}
                  >
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {subject.subject_name}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {subject.department_name}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{subject.faculty_name || 'TBD'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(subject);
                        }}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSubjects.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No subjects found.</p>
            </div>
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
