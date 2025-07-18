import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StudentAttendanceCalendarModel from '../../components/models/StudentAttendanceCalendarModel';

const StudentsManager = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ departmentId: '', year: '', section: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Fetch students from backend
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.year) params.year = filters.year;
      if (filters.section) params.section = filters.section;
      const res = await axios.get('/api/admin/students', { params });
      setStudents(res.data.students || []);
    } catch (err) {
      setError('Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Handle row click to open calendar modal
  const handleRowClick = (student) => {
    setSelectedStudent(student);
    setIsCalendarOpen(true);
  };

  const handleCloseCalendar = () => {
    setIsCalendarOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div>
      <h2>Students Manager</h2>
      <div style={{ marginBottom: 16 }}>
        <label>Department ID: <input name="departmentId" value={filters.departmentId} onChange={handleFilterChange} /></label>
        <label style={{ marginLeft: 8 }}>Year: <input name="year" value={filters.year} onChange={handleFilterChange} /></label>
        <label style={{ marginLeft: 8 }}>Section: <input name="section" value={filters.section} onChange={handleFilterChange} /></label>
      </div>
      {loading ? (
        <p>Loading students...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Department</th>
              <th>Year</th>
              <th>Section</th>
              <th>Face Registered</th>
              <th>Face Image</th>
              <th>Attendance</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.student_id} onClick={() => handleRowClick(student)} style={{ cursor: 'pointer' }}>
                <td>{student.roll_number}</td>
                <td>{student.name}</td>
                <td>{student.department_name}</td>
                <td>{student.current_year}</td>
                <td>{student.section}</td>
                <td>{student.face_registered ? '✅' : '❌'}</td>
                <td>
                  {student.face_registered && student.face_image_url ? (
                    <img src={student.face_image_url} alt="Face" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  <button type="button">View Calendar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {isCalendarOpen && selectedStudent && (
        <StudentAttendanceCalendarModel
          studentId={selectedStudent.student_id}
          studentName={selectedStudent.name}
          onClose={handleCloseCalendar}
        />
      )}
    </div>
  );
};

export default StudentsManager; 