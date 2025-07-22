// src/pages/subjects/EnrolledStudents.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
// --- 1. IMPORT: Add ArrowLeft, Upload, and Printer icons ---
import { ArrowLeft, Upload, Printer, Filter, Calendar as CalendarIcon, Download, XCircle, History } from "lucide-react";
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
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState("");

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

  // --- CSV EXPORT LOGIC ---
  const handleExportCSV = async () => {
    if (!subject?.subject_id) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `/api/admin/enrollments/${subject.subject_id}/export-csv`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subject_${subject.subject_id}_enrollments.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error exporting CSV: ' + err.message);
    }
  };

  // --- REMOVE STUDENT FROM SUBJECT ---
  const handleRemoveStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to remove ${student.name} (${student.rollNo}) from this subject?`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/students/remove-subject', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ student_id: student.student_id, subject_id: subject.subject_id }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove student');
      }
      // Refresh the enrolled students list
      setEnrolledStudents(prev => prev.filter(s => s.student_id !== student.student_id));
      alert(`${student.name} has been removed from this subject.`);
    } catch (err) {
      alert('Error removing student: ' + err.message);
    }
  };

  // Fetch audit/history for this subject
  const fetchHistory = async () => {
    if (!subject?.subject_id) return;
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/enrollments/audit?subject_id=${subject.subject_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setHistory(data.audit || []);
    } catch (err) {
      setHistoryError(err.message);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleShowHistory = () => {
    setShowHistory(true);
    fetchHistory();
  };
  const handleCloseHistory = () => setShowHistory(false);

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
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                <Download size={16} /> Export CSV
              </button>
              <button
                onClick={handleShowHistory}
                className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                <History size={16} /> View History
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
                        <button
                          type="button"
                          className="inline-flex items-center justify-center p-2 rounded hover:bg-red-100 ml-2"
                          title="Remove from Subject"
                          onClick={e => { e.stopPropagation(); handleRemoveStudent(student); }}
                        >
                          <XCircle size={18} className="text-red-600" />
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
      {/* Enrollment History Modal/Section */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            <button onClick={handleCloseHistory} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl">&times;</button>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><History size={20}/> Enrollment History</h3>
            {historyLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : historyError ? (
              <div className="text-center text-red-600 py-8">{historyError}</div>
            ) : history.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No enrollment history found for this subject.</div>
            ) : (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Student ID</th>
                      <th className="p-2 border">Action</th>
                      <th className="p-2 border">Admin</th>
                      <th className="p-2 border">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry, i) => (
                      <tr key={entry.audit_id || i}>
                        <td className="p-2 border">{entry.student_id}</td>
                        <td className="p-2 border font-semibold capitalize">{entry.action}</td>
                        <td className="p-2 border">{entry.admin_name || entry.admin_id || 'Unknown'}</td>
                        <td className="p-2 border">{new Date(entry.action_timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
