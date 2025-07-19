import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Printer,
  Search,
  AlertTriangle,
  Calendar as CalendarIcon
} from "lucide-react";
import { subjectsAPI } from "../api/subjects";

const SubjectDetail = ({ subject, onBack, onSelectStudent }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowAttendanceOnly, setShowLowAttendanceOnly] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!subject) return;
    setLoading(true);
    setError("");
    subjectsAPI.getSubjectStudents(subject.id || subject.subject_id)
      .then((students) => setEnrolledStudents(students))
      .catch((err) => {
        setError(err.message || "Failed to fetch enrolled students.");
        setEnrolledStudents([]);
      })
      .finally(() => setLoading(false));
  }, [subject]);

  const getAttendanceBarColor = (percentage) => {
    if (percentage < 75) return "bg-red-500";
    return "bg-blue-500";
  };

  const filteredStudents = useMemo(() => {
    return enrolledStudents
      .filter((student) => {
        const term = searchTerm.toLowerCase();
        return (
          student.name.toLowerCase().includes(term) ||
          student.rollNo.toLowerCase().includes(term)
        );
      })
      .filter((student) => {
        return !showLowAttendanceOnly || student.attendance < 75;
      });
  }, [enrolledStudents, searchTerm, showLowAttendanceOnly]);

  // --- ✨ NEW: Print Functionality ---
  const handlePrint = () => {
    // 1. Create the HTML content for the printout
    const printContent = `
      <html>
        <head>
          <title>Attendance Report - ${subject.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { color: #333; }
            h1 { font-size: 24px; }
            h2 { font-size: 20px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .low-attendance { color: #D32F2F; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Attendance Report</h1>
          <h2>Subject: ${subject.name}</h2>
          <p>Date: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Roll No.</th>
                <th>Student Name</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              ${filteredStudents
                .map(
                  (student) => `
                <tr>
                  <td>${student.rollNo}</td>
                  <td>${student.name}</td>
                  <td class="${student.attendance < 75 ? 'low-attendance' : ''}">${student.attendance}%</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // 2. Create a hidden iframe to load the content
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    // 3. Write the content to the iframe and trigger the print dialog
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(printContent);
    doc.close();
    iframe.contentWindow.focus(); // Focus is required for some browsers
    iframe.contentWindow.print();

    // 4. Remove the iframe after a delay
    setTimeout(() => {
        document.body.removeChild(iframe);
    }, 1000);
  };

  if (!subject) {
    return (
      <div className="text-center">
        <p>No subject selected. Please go back and select a subject.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Subjects
          </button>
          <div className="flex justify-between">
            <h2 className="text-3xl font-bold text-gray-800">{subject.name}</h2>
          </div>
          <p className="text-gray-500 mt-1">
            Student attendance overview for this subject.
          </p>
        </div>

        <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or roll no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          <button
            onClick={() => setShowLowAttendanceOnly(!showLowAttendanceOnly)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium shadow-sm transition-colors duration-200 ${
                showLowAttendanceOnly
                    ? "bg-red-500 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <AlertTriangle size={18} className="mr-2" />
            {showLowAttendanceOnly
              ? "Showing Low Attendance"
              : "Filter Low Attendance"}
          </button>
          {/* ✨ UPDATED: Added onClick handler to the Print button */}
          <button 
            onClick={handlePrint}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 shadow-sm">
            <Printer size={18} className="mr-2" />
            Print
          </button>
        </div>
      </div>

      {/* Students List Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
                <th className="px-6 py-3"></th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Calendar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="cursor-pointer hover:bg-gray-50 group"
                    onClick={() => onSelectStudent(student)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{student.rollNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-4">
                          <div
                            className={`${getAttendanceBarColor(student.attendance)} h-2.5 rounded-full`}
                            style={{ width: `${student.attendance}%` }}
                          ></div>
                        </div>
                        <span
                          className={`font-medium text-sm w-12 text-right ${
                            student.attendance < 75 ? "text-red-600" : "text-gray-600"
                          }`}
                        >
                          {student.attendance}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-600"/>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center p-2 rounded hover:bg-gray-100"
                        title="View Attendance Calendar"
                        onClick={e => { e.stopPropagation(); onSelectStudent(student); }}
                      >
                        <CalendarIcon size={18} className="text-blue-600" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-500">
                    No students found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default SubjectDetail;
