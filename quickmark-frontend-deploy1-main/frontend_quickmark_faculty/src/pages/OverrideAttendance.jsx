import React, { useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { subjectsAPI } from '../api/subjects';
import { overrideAttendance, getStudentCalendarAttendance, getOverrideLog } from '../api/attendance';
// Use a different icon for override log (e.g., ArrowPathIcon from Heroicons)
const ArrowPathIcon = (props) => (
  <svg {...props} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.75 10a5.25 5.25 0 019.45-2.98M15.25 10a5.25 5.25 0 01-9.45 2.98M4.75 10V7.75M4.75 10h2.25M15.25 10v2.25M15.25 10h-2.25" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const OverrideAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [newStatus, setNewStatus] = useState('present');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [overrideLog, setOverrideLog] = useState([]); // Optional: log/history
  const [showConfirm, setShowConfirm] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        let subjects = [];
        if (subjectsAPI.getMySubjects) {
          subjects = await subjectsAPI.getMySubjects();
        } else {
          const profile = await authAPI.getProfile();
          subjects = profile.subjects || profile.subjectsTaught || [];
        }
        setSubjects(subjects);
      } catch (error) {
        setSubjects([]);
        setFeedback('Failed to fetch subjects.');
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedSubject) {
        setStudents([]);
        return;
      }
      try {
        const students = await subjectsAPI.getSubjectStudents(selectedSubject);
        setStudents(students);
      } catch (error) {
        setStudents([]);
        setFeedback('Failed to fetch students for this subject.');
      }
    };
    fetchStudents();
    setSelectedStudent('');
    setStudentSearch('');
  }, [selectedSubject]);

  useEffect(() => {
    const fetchCurrentStatus = async () => {
      if (!selectedSubject || !selectedStudent || !selectedDate) {
        setCurrentStatus('');
        return;
      }
      try {
        const dateObj = new Date(selectedDate);
        const month = dateObj.getMonth() + 1;
        const year = dateObj.getFullYear();
        const data = await getStudentCalendarAttendance(selectedSubject, selectedStudent, month, year);
        const status = data[selectedDate] || 'N/A';
        setCurrentStatus(status);
      } catch (error) {
        setCurrentStatus('N/A');
      }
    };
    fetchCurrentStatus();
  }, [selectedSubject, selectedStudent, selectedDate]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Fetch override log/history when subject and student are selected
  useEffect(() => {
    const fetchOverrideLog = async () => {
      if (!selectedSubject || !selectedStudent) {
        setOverrideLog([]);
        return;
      }
      try {
        const log = await getOverrideLog(selectedSubject, selectedStudent);
        setOverrideLog(log);
      } catch (error) {
        setOverrideLog([]);
      }
    };
    fetchOverrideLog();
  }, [selectedSubject, selectedStudent]);

  const filteredStudents = students.filter(stu => {
    const search = studentSearch.toLowerCase();
    return (
      stu.name.toLowerCase().includes(search) ||
      (stu.roll_number || stu.rollNo || '').toLowerCase().includes(search)
    );
  });

  const handleOverride = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const confirmOverride = async () => {
    setShowConfirm(false);
    setFeedback('');
    setLoading(true);
    try {
      await overrideAttendance(selectedSubject, selectedStudent, selectedDate, newStatus);
      setFeedback('Attendance overridden successfully!');
      setCurrentStatus(newStatus);
    } catch (error) {
      setFeedback(error.response?.data?.message || error.message || 'Failed to override attendance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg relative">
      <h2 className="text-3xl font-extrabold mb-6 text-blue-900 tracking-tight text-center">Override Attendance</h2>
      <form onSubmit={handleOverride} className="space-y-6">
        <div className="bg-white rounded-xl shadow p-4 mb-2">
          <h3 className="font-semibold text-blue-700 mb-2 text-lg">Step 1: Select Subject</h3>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400" disabled={loading}>
            <option value="">Select Subject</option>
            {subjects.map(subj => (
              <option key={subj.subject_id || subj.id} value={subj.subject_id || subj.id}>{subj.subject_name || subj.name}</option>
            ))}
          </select>
        </div>
        <div className="bg-white rounded-xl shadow p-4 mb-2">
          <h3 className="font-semibold text-blue-700 mb-2 text-lg">Step 2: Select Student</h3>
          <input
            type="text"
            placeholder="Search by name or roll number"
            value={studentSearch}
            onChange={e => setStudentSearch(e.target.value)}
            className="w-full border rounded p-2 mb-2 focus:ring-2 focus:ring-blue-400"
            disabled={!selectedSubject || loading}
          />
          <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400" disabled={!selectedSubject || loading}>
            <option value="">Select Student</option>
            {filteredStudents.map(stu => (
              <option key={stu.student_id || stu.id} value={stu.student_id || stu.id}>{stu.name} ({stu.roll_number || stu.rollNo})</option>
            ))}
          </select>
        </div>
        <div className="bg-white rounded-xl shadow p-4 mb-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-blue-700 mb-2 text-lg">Step 3: Pick Date</h3>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400" disabled={!selectedStudent || loading} />
          </div>
          <div>
            <h3 className="font-semibold text-blue-700 mb-2 text-lg">Current Status</h3>
            <div className={`p-2 border rounded bg-gray-50 text-center text-lg font-semibold ${currentStatus === 'present' ? 'text-green-700' : currentStatus === 'absent' ? 'text-red-700' : currentStatus === 'late' ? 'text-yellow-700' : ''}`}>{currentStatus || 'N/A'}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 mb-2">
          <h3 className="font-semibold text-blue-700 mb-2 text-lg">Step 4: Set New Status</h3>
          <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400" disabled={loading}>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-bold text-lg shadow hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading || !selectedSubject || !selectedStudent || !selectedDate}>
          {loading ? <span className="animate-spin mr-2 inline-block align-middle">⏳</span> : null}
          {loading ? 'Overriding...' : 'Override Attendance'}
        </button>
      </form>
      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Confirm Override</h3>
            <p className="mb-4">
              Are you sure you want to override attendance for this student on <b>{selectedDate}</b> to <b>{newStatus}</b>?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={confirmOverride} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Confirm</button>
            </div>
          </div>
        </div>
      )}
      {/* Toast for feedback */}
      {feedback && (
        <div className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow-lg z-50 ${feedback.includes('success') ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {feedback}
        </div>
      )}
      {/* Optional: Override log/history */}
      {overrideLog.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-3 text-blue-700 flex items-center text-lg">
            <ArrowPathIcon className="w-5 h-5 mr-2 inline-block" />
            Recent Overrides
          </h3>
          <ul className="text-sm space-y-2">
            {overrideLog.map((log, idx) => {
              const details = log.details || {};
              return (
                <li key={log.log_id || idx} className="flex items-center gap-2 border-b pb-1 last:border-b-0">
                  <ArrowPathIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="font-medium">{details.date || log.created_at?.slice(0, 10)}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${details.status === 'present' ? 'bg-green-100 text-green-700' : details.status === 'absent' ? 'bg-red-100 text-red-700' : details.status === 'late' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{details.status}</span>
                  <span className="ml-auto text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OverrideAttendance; 