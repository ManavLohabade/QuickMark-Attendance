const API_BASE_URL = 'https://quickmark-backend-deploy1.onrender.com/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return handleResponse(response);
};

// Faculty Subjects API
export const subjectsAPI = {
  // Get all subjects assigned to the logged-in faculty
  getMySubjects: async () => {
    const response = await apiRequest('/faculty/me/subjects');
    return response.map(subject => ({
      id: subject.subject_id,
      name: subject.subject_name,
      department: subject.department_name,
      year: subject.year,
      section: subject.section,
      semester: subject.semester,
      batchName: `Batch ${new Date().getFullYear() - subject.year + 1}`,
    }));
  },

  // Get enrolled students for a specific subject
  getSubjectStudents: async (subjectId) => {
    const response = await apiRequest(`/faculty/subjects/${subjectId}/students`);
    return response.students.map(student => ({
      id: student.student_id,
      name: student.student_name,
      rollNo: student.roll_number,
      email: student.email,
      department: student.department_name,
      attendance: 85, // This would come from attendance calculations
    }));
  },
};
