import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/api';

export default function CoreEnrollments({ departments }) {
  const [departmentId, setDepartmentId] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [semester, setSemester] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollGrid, setEnrollGrid] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: group select, 2: card select, 3: view
  const [selectedCard, setSelectedCard] = useState(null); // 'students', 'subjects', 'both'

  const yearOptions = [1, 2, 3, 4];
  const sectionOptions = ['A', 'B', 'C'];
  const semesterOptions = [1, 2];

  // Fetch subjects and students for the selected group
  const handleGo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    console.log('[handleGo] Filters:', { departmentId, year, section, semester });
    try {
      const [subjectsRes, studentsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/subjects`, {
          params: { department_id: departmentId, year, section, semester },
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        }),
        axios.get(`${API_BASE_URL}/api/admin/students`, {
          params: { department_id: departmentId, year, section },
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        })
      ]);
      setSubjects(subjectsRes.data.subjects || []);
      setStudents(studentsRes.data.students || []);
      // Initialize grid: all checked by default
      const grid = {};
      (studentsRes.data.students || []).forEach(s => {
        grid[s.student_id] = {};
        (subjectsRes.data.subjects || []).forEach(sub => {
          grid[s.student_id][sub.subject_id] = true;
        });
      });
      setEnrollGrid(grid);
      setStep(2);
    } catch (err) {
      setResult({ errors: [{ error: err.response?.data?.message || err.message }] });
    }
    setLoading(false);
  };

  // Handle checkbox change
  const handleCheck = (student_id, subject_id) => {
    setEnrollGrid(prev => ({
      ...prev,
      [student_id]: {
        ...prev[student_id],
        [subject_id]: !prev[student_id][subject_id]
      }
    }));
  };

  // Select/Deselect all for a subject
  const handleSubjectAll = (subject_id, checked) => {
    setEnrollGrid(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(sid => {
        updated[sid][subject_id] = checked;
      });
      return updated;
    });
  };

  // Select/Deselect all for a student
  const handleStudentAll = (student_id, checked) => {
    setEnrollGrid(prev => ({
      ...prev,
      [student_id]: Object.fromEntries(Object.keys(prev[student_id] || {}).map(subid => [subid, checked]))
    }));
  };

  // Count selected enrollments
  const selectedCount = useMemo(() => {
    let count = 0;
    Object.values(enrollGrid).forEach(subMap => {
      count += Object.values(subMap).filter(Boolean).length;
    });
    return count;
  }, [enrollGrid]);

  // Submit selected enrollments
  const handleEnroll = async () => {
    setLoading(true);
    setResult(null);
    const enrollments = [];
    Object.entries(enrollGrid).forEach(([student_id, subMap]) => {
      Object.entries(subMap).forEach(([subject_id, checked]) => {
        if (checked) enrollments.push({ student_id, subject_id });
      });
    });
    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/enrollments/bulk/manual`, { enrollments }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setResult(res.data);
    } catch (err) {
      setResult({ errors: [{ error: err.response?.data?.message || err.message }] });
    }
    setLoading(false);
  };

  // Card click handler
  const handleCardClick = (card) => {
    setSelectedCard(card);
    setStep(3);
  };

  // Go back to filter selection and clear results
  const handleBackToFilter = () => {
    setStep(1);
    setSelectedCard(null);
    setStudents([]);
    setSubjects([]);
    setEnrollGrid({});
    setResult(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Enrollments</h2>
      {step === 1 && (
        <form onSubmit={handleGo} className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow">
          <div>
            <label className="block mb-1 font-medium">Department</label>
            <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} required className="border px-2 py-1 w-full rounded">
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d.department_id} value={d.department_id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Year</label>
            <select value={year} onChange={e => setYear(e.target.value)} required className="border px-2 py-1 w-full rounded">
              <option value="">Select Year</option>
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Section</label>
            <select value={section} onChange={e => setSection(e.target.value)} required className="border px-2 py-1 w-full rounded">
              <option value="">Select Section</option>
              {sectionOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Semester</label>
            <select value={semester} onChange={e => setSemester(e.target.value)} required className="border px-2 py-1 w-full rounded">
              <option value="">Select Semester</option>
              {semesterOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded shadow" disabled={loading}>
              {loading ? 'Loading...' : 'Go'}
            </button>
          </div>
        </form>
      )}
      {step === 2 && (
        <>
          <div className="mb-4 flex justify-end">
            <button className="text-blue-600 underline" onClick={handleBackToFilter}>← Back to Filter</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div onClick={() => handleCardClick('students')} className="cursor-pointer bg-white rounded-xl shadow p-6 hover:bg-blue-50 transition">
              <h3 className="text-xl font-semibold mb-2">Fetch Students</h3>
              <p className="text-gray-600">View the list of students for the selected group.</p>
            </div>
            <div onClick={() => handleCardClick('subjects')} className="cursor-pointer bg-white rounded-xl shadow p-6 hover:bg-blue-50 transition">
              <h3 className="text-xl font-semibold mb-2">Fetch Subjects</h3>
              <p className="text-gray-600">View the list of subjects for the selected group.</p>
            </div>
            <div onClick={() => handleCardClick('both')} className="cursor-pointer bg-white rounded-xl shadow p-6 hover:bg-blue-50 transition">
              <h3 className="text-xl font-semibold mb-2">Both (Manual Enrollment)</h3>
              <p className="text-gray-600">Manually enroll students in subjects using the grid.</p>
            </div>
          </div>
        </>
      )}
      {step === 3 && selectedCard === 'students' && (
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <div className="mb-4">
            <button className="text-blue-600 underline" onClick={() => setStep(2)}>← Back to Cards</button>
          </div>
          <h3 className="text-xl font-semibold mb-4">Students</h3>
          <ul className="list-disc ml-6">
            {students.map(stu => (
              <li key={stu.student_id}>{stu.name} <span className="text-xs text-gray-500">({stu.roll_number})</span></li>
            ))}
          </ul>
          <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setStep(2)}>Back</button>
        </div>
      )}
      {step === 3 && selectedCard === 'subjects' && (
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <div className="mb-4">
            <button className="text-blue-600 underline" onClick={() => setStep(2)}>← Back to Cards</button>
          </div>
          <h3 className="text-xl font-semibold mb-4">Subjects</h3>
          <ul className="list-disc ml-6">
            {subjects.map(sub => (
              <li key={sub.subject_id}>{sub.subject_name} <span className="text-xs text-gray-500">({sub.subject_code})</span></li>
            ))}
          </ul>
          <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setStep(2)}>Back</button>
        </div>
      )}
      {step === 3 && selectedCard === 'both' && (
        <>
          <div className="mb-4 flex gap-4">
            <button className="text-blue-600 underline" onClick={() => setStep(2)}>← Back to Cards</button>
            <button className="text-blue-600 underline" onClick={handleBackToFilter}>← Back to Filter</button>
          </div>
          <div className="font-semibold">Selected Enrollments: {selectedCount}</div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded shadow" onClick={handleEnroll} disabled={loading}>
            {loading ? 'Enrolling...' : 'Enroll Selected'}
          </button>
          <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
            <table className="min-w-full border text-sm">
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr>
                  <th className="border px-2 py-1">Student</th>
                  <th className="border px-2 py-1">Select All</th>
                  {subjects.map(sub => (
                    <th key={sub.subject_id} className="border px-2 py-1">
                      <div className="font-semibold">{sub.subject_name}</div>
                      <div className="text-xs text-gray-500">{sub.subject_code}</div>
                      <div>
                        <input type="checkbox" checked={students.every(stu => enrollGrid[stu.student_id]?.[sub.subject_id])}
                          onChange={e => handleSubjectAll(sub.subject_id, e.target.checked)} />
                        <span className="text-xs ml-1">All</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(stu => (
                  <tr key={stu.student_id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1 font-medium">{stu.name} <span className="text-xs text-gray-500">({stu.roll_number})</span></td>
                    <td className="border px-2 py-1 text-center">
                      <input type="checkbox" checked={Object.values(enrollGrid[stu.student_id] || {}).every(Boolean)}
                        onChange={e => handleStudentAll(stu.student_id, e.target.checked)} />
                      <span className="text-xs ml-1">All</span>
                    </td>
                    {subjects.map(sub => (
                      <td key={sub.subject_id} className="border px-2 py-1 text-center">
                        <input type="checkbox" checked={!!enrollGrid[stu.student_id]?.[sub.subject_id]}
                          onChange={() => handleCheck(stu.student_id, sub.subject_id)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {result && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Results:</h3>
          {result.enrolled && result.enrolled.length > 0 && (
            <div className="mb-4">
              <strong>Enrolled:</strong>
              <ul className="list-disc ml-6">
                {result.enrolled.map((r, i) => (
                  <li key={i}>Student {r.student_id} in Subject {r.subject_id}</li>
                ))}
              </ul>
            </div>
          )}
          {result.skipped && result.skipped.length > 0 && (
            <div className="mb-4">
              <strong>Skipped (already enrolled):</strong>
              <ul className="list-disc ml-6">
                {result.skipped.map((r, i) => (
                  <li key={i}>Student {r.student_id} in Subject {r.subject_id} ({r.reason})</li>
                ))}
              </ul>
            </div>
          )}
          {result.errors && result.errors.length > 0 && (
            <div className="mb-4 text-red-600">
              <strong>Errors:</strong>
              <ul className="list-disc ml-6">
                {result.errors.map((r, i) => (
                  <li key={i}>{r.student_id && `Student ${r.student_id} `}in Subject {r.subject_id}: {r.error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 