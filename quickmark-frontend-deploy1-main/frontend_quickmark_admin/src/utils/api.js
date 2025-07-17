// API utility for admin frontend
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
  const token = localStorage.getItem('adminToken');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  console.log('🌐 API Request:', {
    url: `${API_BASE_URL}${endpoint}`,
    method: config.method || 'GET',
    headers: config.headers,
    body: config.body ? JSON.parse(config.body) : undefined
  });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  console.log('📡 Response status:', response.status);
  
  return handleResponse(response);
};

// Authentication APIs
export const authAPI = {
  login: async (email, password) => {
    console.log('🔐 Login attempt with:', { email, password: '***' });
    console.log('🔍 Current localStorage token:', localStorage.getItem('adminToken'));
    
    // Clear any existing token before login
    localStorage.removeItem('adminToken');
    console.log('🧹 Cleared existing token');
    
    const response = await apiRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    console.log('📥 Login response:', response);
    
    if (response.token) {
      localStorage.setItem('adminToken', response.token);
      console.log('💾 Token saved to localStorage');
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('adminToken');
  },

  register: async (name, email, password) => {
    return await apiRequest('/admin/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: async () => {
    const response = await apiRequest('/admin/dashboard/stats');
    return {
      departments: response.departments || 0,
      faculties: response.faculties || 0,
      students: response.students || 0,
      subjects: response.subjects || 0,
      defaulters: response.defaulters || 0,
    };
  },

  getAttendanceStats: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return await apiRequest(`/admin/dashboard/attendance-stats?${params}`);
  },
};

// Department APIs
export const departmentAPI = {
  getAll: async (page = 1, limit = 10) => {
    const response = await apiRequest(`/admin/departments?page=${page}&limit=${limit}`);
    return {
      departments: response.departments || response,
      totalItems: response.totalItems || 0,
      totalPages: response.totalPages || 1,
      currentPage: response.currentPage || page,
    };
  },

  create: async (name) => {
    const backendData = dataTransformers.transformToBackend.department({ name });
    return await apiRequest('/admin/departments', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  },

  update: async (departmentId, name) => {
    const backendData = dataTransformers.transformToBackend.department({ name });
    return await apiRequest(`/admin/departments/${departmentId}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
  },

  delete: async (departmentId) => {
    return await apiRequest(`/admin/departments/${departmentId}`, {
      method: 'DELETE',
    });
  },
};

// Faculty APIs
export const facultyAPI = {
  getAll: async (page = 1, limit = 10) => {
    const response = await apiRequest(`/admin/faculty?page=${page}&limit=${limit}`);
    return {
      faculty: response.faculty || response,
      totalItems: response.totalItems || 0,
      totalPages: response.totalPages || 1,
      currentPage: response.currentPage || page,
    };
  },

  create: async (facultyData) => {
    const backendData = dataTransformers.transformToBackend.faculty(facultyData);
    return await apiRequest('/admin/faculty', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  },

  update: async (facultyId, facultyData) => {
    const backendData = dataTransformers.transformToBackend.faculty(facultyData);
    return await apiRequest(`/admin/faculty/${facultyId}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
  },

  delete: async (facultyId) => {
    return await apiRequest(`/admin/faculty/${facultyId}`, {
      method: 'DELETE',
    });
  },
};

// Student APIs
export const studentAPI = {
  getAll: async (page = 1, limit = 10) => {
    const response = await apiRequest(`/admin/students?page=${page}&limit=${limit}`);
    return {
      students: response.students || response,
      totalItems: response.totalItems || 0,
      totalPages: response.totalPages || 1,
      currentPage: response.currentPage || page,
    };
  },

  create: async (studentData) => {
    console.log('Student API create - Input data:', studentData);
    const backendData = dataTransformers.transformToBackend.student(studentData);
    console.log('Student API create - Transformed data:', backendData);
    return await apiRequest('/admin/students', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  },

  update: async (studentId, studentData) => {
    console.log('Updating student with data:', studentData);
    const backendData = dataTransformers.transformToBackend.student(studentData);
    console.log('Transformed to backend format:', backendData);
    return await apiRequest(`/admin/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
  },

  delete: async (studentId) => {
    return await apiRequest(`/admin/students/${studentId}`, {
      method: 'DELETE',
    });
  },
};

// Subject APIs
export const subjectAPI = {
  getAll: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    
    const response = await apiRequest(`/admin/subjects?${params}`);
    return {
      subjects: response.subjects || response,
      totalItems: response.totalItems || 0,
      totalPages: response.totalPages || 1,
      currentPage: response.currentPage || page,
    };
  },

  create: async (subjectData) => {
    const backendData = dataTransformers.transformToBackend.subject(subjectData);
    return await apiRequest('/admin/subjects', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  },

  update: async (subjectId, subjectData) => {
    console.log('Subject API update - Input data:', subjectData);
    const backendData = dataTransformers.transformToBackend.subject(subjectData);
    console.log('Subject API update - Transformed data:', backendData);
    return await apiRequest(`/admin/subjects/${subjectId}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
  },

  delete: async (subjectId) => {
    return await apiRequest(`/admin/subjects/${subjectId}`, {
      method: 'DELETE',
    });
  },
};

// Settings APIs
export const settingsAPI = {
  getAttendanceThreshold: async () => {
    const response = await apiRequest('/admin/settings/attendance-threshold');
    return response.threshold || 75;
  },

  updateAttendanceThreshold: async (threshold) => {
    const numericThreshold = parseInt(threshold, 10);
    if (isNaN(numericThreshold) || numericThreshold < 0 || numericThreshold > 100) {
      throw new Error('Threshold must be a number between 0 and 100.');
    }
    return await apiRequest('/admin/settings/attendance-threshold', {
      method: 'PUT',
      body: JSON.stringify({ threshold: numericThreshold }),
    });
  },
};

// Reports APIs
export const reportsAPI = {
  getDefaulters: async (threshold = 75, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      threshold: threshold.toString(),
      page: page.toString(),
      limit: limit.toString(),
    });
    
    const response = await apiRequest(`/admin/reports/defaulters?${params}`);
    return {
      defaulters: response.defaulters || response,
      totalItems: response.totalItems || 0,
      totalPages: response.totalPages || 1,
      currentPage: response.currentPage || page,
    };
  },

  backupData: async () => {
    return await apiRequest('/admin/reports/backup', {
      method: 'GET',
      responseType: 'blob',
    });
  },

  printAttendanceSheet: async () => {
    return await apiRequest('/admin/reports/print-attendance', {
      method: 'GET',
      responseType: 'blob',
    });
  },

  // Get student calendar attendance (for admin viewing student attendance)
  getStudentCalendarAttendance: async (subjectId, studentId, month, year) => {
    const url = `/attendance/admin/subjects/${subjectId}/students/${studentId}/calendar?month=${month}&year=${year}`;
    console.log('🌐 Admin Calendar API - Calling URL:', url);
    return await apiRequest(url);
  },
};

// Data transformation helpers to match frontend expectations
export const dataTransformers = {
  // Transform backend department data to frontend format
  transformDepartments: (departments) => {
    return departments.map(dept => ({
      department_id: dept.department_id,
      name: dept.name,
      createdAt: dept.created_at,
      updatedAt: dept.updated_at,
    }));
  },

  // Transform backend faculty data to frontend format
  transformFaculty: (faculty) => {
    return faculty.map(f => ({
      faculty_id: f.faculty_id,
      name: f.name,
      email: f.email,
      department: f.department_name,
      designation: f.designation || 'Faculty',
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));
  },

  // Transform backend student data to frontend format
  transformStudents: (students) => {
    return students.map(s => ({
      student_id: s.student_id,
      name: s.name,
      rollNo: s.roll_number,
      email: s.email,
      department: s.department_name,
      startYear: s.current_year,
      section: s.section,
      attendance: s.attendance_percentage || 0,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));
  },

  // Transform backend subject data to frontend format
  transformSubjects: (subjects) => {
    return subjects.map(s => ({
      subject_id: s.subject_id,
      name: s.subject_name,
      department: s.department_name,
      faculty: s.faculty_name || 'TBD',
      startYear: s.year,
      semester: s.semester,
      section: s.section,
      createdAt: s.created_at,
    }));
  },

  // Transform backend defaulter data to frontend format
  transformDefaulters: (defaulters) => {
    return defaulters.map(d => ({
      student_id: d.student_id,
      name: d.name,
      rollNo: d.roll_number,
      email: d.email,
      department: d.department_name,
      startYear: d.current_year,
      section: d.section,
      attendance: d.attendance_percentage,
      totalSessions: d.total_sessions,
      presentSessions: d.present_sessions,
    }));
  },

  // Reverse transformations for sending data to backend
  transformToBackend: {
    // Transform frontend subject data to backend format
    subject: (subjectData) => {
      console.log('Subject transformation - Input:', subjectData);
      const transformed = {
        subject_name: subjectData.subject_name,
        subject_code: subjectData.subject_code,
        department_id: subjectData.department_id,
        year: subjectData.year,
        section: subjectData.section,
        semester: subjectData.semester,
      };
      console.log('Subject transformation - Output:', transformed);
      return transformed;
    },

    // Transform frontend student data to backend format
    student: (studentData) => {
      console.log('Transforming student data:', studentData);
      console.log('startYear value:', studentData.startYear, 'type:', typeof studentData.startYear);
      const transformed = {
        roll_number: studentData.rollNo || studentData.roll_number,
        name: studentData.name,
        email: studentData.email,
        department_id: studentData.department_id,
        current_year: parseInt(studentData.startYear || studentData.current_year),
        section: studentData.section,
      };
      console.log('Transformed student data:', transformed);
      console.log('current_year value:', transformed.current_year, 'type:', typeof transformed.current_year);
      return transformed;
    },

    // Transform frontend faculty data to backend format
    faculty: (facultyData) => {
      const transformed = {
        name: facultyData.name,
        email: facultyData.email,
        department_id: facultyData.department_id,
        designation: facultyData.designation || 'Faculty',
      };
      
      // Only include password if it's provided (for new faculty or password updates)
      if (facultyData.password) {
        transformed.password = facultyData.password;
      }
      
      return transformed;
    },

    // Transform frontend department data to backend format
    department: (departmentData) => {
      return {
        name: departmentData.name,
      };
    },
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

// Faculty Assignment APIs
export const facultyAssignmentAPI = {
  assignSubjectToFaculty: async (facultyId, subjectId) => {
    return await apiRequest('/admin/faculty/assign-subject', {
      method: 'POST',
      body: JSON.stringify({ faculty_id: facultyId, subject_id: subjectId }),
    });
  },

  removeSubjectFromFaculty: async (facultyId, subjectId) => {
    return await apiRequest('/admin/faculty/remove-subject', {
      method: 'DELETE',
      body: JSON.stringify({ faculty_id: facultyId, subject_id: subjectId }),
    });
  },

  getFacultyAssignments: async (facultyId) => {
    return await apiRequest(`/admin/faculty/${facultyId}/assignments`);
  },
};

// Student Enrollment APIs
export const studentEnrollmentAPI = {
  enrollStudentInSubject: async (studentId, subjectId) => {
    return await apiRequest('/admin/students/enroll-subject', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, subject_id: subjectId }),
    });
  },

  removeStudentFromSubject: async (studentId, subjectId) => {
    return await apiRequest('/admin/students/remove-subject', {
      method: 'DELETE',
      body: JSON.stringify({ student_id: studentId, subject_id: subjectId }),
    });
  },

  getStudentEnrollments: async (studentId) => {
    return await apiRequest(`/admin/students/${studentId}/enrollments`);
  },

  getSubjectEnrollments: async (subjectId) => {
    return await apiRequest(`/admin/subjects/${subjectId}/enrollments`);
  },
};

export default {
  auth: authAPI,
  dashboard: dashboardAPI,
  departments: departmentAPI,
  faculty: facultyAPI,
  students: studentAPI,
  subjects: subjectAPI,
  settings: settingsAPI,
  reports: reportsAPI,
  transformers: dataTransformers,
  healthCheck,
  facultyAssignment: facultyAssignmentAPI,
  studentEnrollment: studentEnrollmentAPI,
};
