// src/pages/subjects/EnrolledStudents.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
// --- 1. IMPORT: Add ArrowLeft, Upload, and Printer icons ---
import { ArrowLeft, Upload, Printer, Filter, Calendar as CalendarIcon } from "lucide-react";
import Calendar from "./Calendar.jsx";
import { studentEnrollmentAPI } from "../../utils/api";

export default function EnrolledStudents({
  subject,
  onBack,
  onImportStudents,
}) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  // --- 2. REF: Create a reference for the hidden file input ---
  const [filterDefaulters, setFilterDefaulters] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const printableContentRef = useRef(null);

  useEffect(() => {
    if (!subject) return;
    setLoading(true);
    setError("");
    studentEnrollmentAPI.getSubjectEnrollments(subject.subject_id)
      .then((res) => {
        setEnrolledStudents(res.enrollments || []);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch enrolled students.");
        setEnrolledStudents([]);
      })
      .finally(() => setLoading(false));
  }, [subject]);

  // --- 3. LOGIC: Create a new memoized list for display ---
  // This will show either all students or only the filtered ones.
  const displayStudents = useMemo(() => {
    if (!filterDefaulters) {
      return enrolledStudents;
    }
    return enrolledStudents.filter((student) => student.attendance < 75);
  }, [enrolledStudents, filterDefaulters]);

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setIsCalendarOpen(true);
  };

  const handleCloseCalendar = () => {
    setIsCalendarOpen(false);
    setSelectedStudent(null);
  };

  // --- 3. IMPORT LOGIC: Functions to handle file import ---
  const handleImportClick = () => {
    fileInputRef.current.click(); // Trigger the hidden file input
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real application, you would parse the CSV and call a function
      // like `onImportStudents(parsedData)` to update the state in App.jsx.
      alert(
        `Successfully imported students from "${file.name}" for subject "${subject.name}".`
      );
      // Reset the file input value to allow importing the same file again
      event.target.value = null;
    }
  };

  // --- 4. PRINT LOGIC: Function to print only the student table ---
  const handlePrint = () => {
    const printContent = printableContentRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    // Create a temporary new window or iframe to print from
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write("<html><head><title>Enrolled Students</title>");
    // Include Tailwind CSS for styling the printed table
    printWindow.document.write(
      '<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">'
    );
    printWindow.document.write(
      "<style>body { padding: 2rem; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; } th { background-color: #f2f2f2; } </style>"
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write(`<h1>Enrolled Students - ${subject.name}</h1>`);
    printWindow.document.write(printContent);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();

    // Use a timeout to ensure content is loaded before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  if (!subject) {
    return (
      <div className="text-center p-8">
        <p>No subject selected. Please go back and select a subject.</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      {isCalendarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <Calendar
            subject={subject}
            student={selectedStudent}
            onBack={handleCloseCalendar}
          />
        </div>
      )}

      <div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {subject.name}
              </h2>
              <p className="text-gray-500">
                {subject.department} - Taught by {subject.faculty}
              </p>
            </div>{" "}
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                className="hidden"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              />
              <button
                onClick={handleImportClick}
                className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                <Upload size={16} /> Import
              </button>
                {/* --- 4. RENDER BUTTON: Add the new filter button --- */}
                <button
                    onClick={() => setFilterDefaulters(!filterDefaulters)}
                    className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-semibold transition-colors ${
                      filterDefaulters
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "hover:bg-gray-50"
                    }`}
                >
                    <Filter size={16}/> {filterDefaulters ? "Show All" : "< 75% Attendance"}
                </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                <Printer size={16} /> Print
              </button>
            </div>
          </div>

          {/* --- 6. The printable area is wrapped with the ref --- */}
          <div ref={printableContentRef}>
            <h3 className="font-bold text-lg mb-4">Enrolled Students List</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-3">Name</th>
                    <th className="p-3">Roll No.</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Overall Attendance</th>
                    <th className="p-3">Calendar</th>
                  </tr>
                </thead>
                <tbody>
                  {displayStudents.map((student) => (
                    <tr
                      key={student.student_id}
                      className="border-b hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => handleStudentClick(student)}
                    >
                      <td className="p-3 font-medium">{student.name}</td>
                      <td className="p-3">{student.rollNo}</td>
                      <td className="p-3">{student.email}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className={`h-2.5 rounded-full ${
                                student.attendance >= 75
                                  ? "bg-primary"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${student.attendance}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold">
                            {student.attendance}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center p-2 rounded hover:bg-gray-100"
                          title="View Attendance Calendar"
                          onClick={e => { e.stopPropagation(); handleStudentClick(student); }}
                        >
                          <CalendarIcon size={18} className="text-blue-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {enrolledStudents.length === 0 && (
                <p className="text-center p-6 text-gray-500">
                  No students are currently enrolled in this subject.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
