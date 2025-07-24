import React, { useState, useEffect } from "react";

// --- Import all your components from their correct folders ---
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import SubjectsList from "./pages/subjects/SubjectsList";
import StudentsList from "./pages/students/StudentsList";
import FacultyList from "./pages/faculty/FacultyList";
import DepartmentPage from "./pages/department/DepartmentPage";
import LowAttendance from "./pages/reports/LowAttendance";
import Settings from "./pages/settings/Settings";
import FaceRegister from "./pages/faceregister/FaceRegister";
import AddEditStudentForm from "./pages/students/AddEditStudentForm";
import Login from "./pages/auth/Login";
import Calendar from "./pages/subjects/Calendar";
import EnrolledStudents from "./pages/subjects/EnrolledStudents";
import DegreesManager from "./pages/admin/DegreesManager";
import AdminActivityLog from "./pages/admin/AdminActivityLog";
import FacultyManagement from './pages/admin/FacultyManagement';
import BulkEnrollStudents from './pages/admin/BulkEnrollStudents';
import CoreEnrollments from './pages/enrollments/CoreEnrollments';
import axios from "axios";
import Home from './pages/Home';
import SystemHealth from './pages/SystemHealth';

// --- Import API utilities ---
import { 
  authAPI, 
  departmentAPI, 
  facultyAPI, 
  studentAPI, 
  subjectAPI, 
  dashboardAPI,
  settingsAPI,
  reportsAPI,
  facultyAssignmentAPI,
  API_BASE_URL
} from "./utils/api";

// Notification component
const Notification = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:text-gray-200">×</button>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("Home");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [attendanceThreshold, setAttendanceThreshold] = useState(75);
  
  // --- Real data state ---
  const [dashboardStats, setDashboardStats] = useState({});
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [degrees, setDegrees] = useState([]);

  // --- Pagination state ---
  const [pagination, setPagination] = useState({
    departments: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
    faculty: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
    students: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
    subjects: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
  });
  
  // --- Notification state ---
  const [notification, setNotification] = useState(null);

  // --- Show notification helper ---
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // --- Check authentication on mount ---
  // useEffect(() => {
  //   const token = localStorage.getItem('adminToken');
  //   if (token) {
  //     setIsAuthenticated(true);
  //   }
  //   setIsLoading(false);
  // }, []);

  useEffect(() => {
    setIsAuthenticated(false); // Always show login page first for testing
    setIsLoading(false);
  }, []);

  // --- Fetch initial data when authenticated ---
  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData();
    }
  }, [isAuthenticated]);

  // --- Fetch initial data when authenticated ---
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchDashboardStats(),
        fetchDepartments(),
        fetchFaculty(),
        fetchStudents(),
        fetchSubjects(),
        fetchDefaulters(),
        fetchAttendanceThreshold(),
        fetchDegrees(),
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      showNotification('Failed to load data. Please refresh the page.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // --- API Data Fetching Functions ---
  const fetchDashboardStats = async () => {
    try {
      const stats = await dashboardAPI.getStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchDepartments = async (page = 1, limit = 10) => {
    try {
      const response = await departmentAPI.getAll(page, limit);
      setDepartments(response.departments);
      setPagination(prev => ({
        ...prev,
        departments: {
          page: response.currentPage,
          limit: limit,
          totalItems: response.totalItems,
          totalPages: response.totalPages,
        }
      }));
    } catch (error) {
      console.error('Error fetching departments:', error);
      showNotification('Failed to load departments', 'error');
    }
  };

  const fetchFaculty = async (page = 1, limit = 10) => {
    try {
      const response = await facultyAPI.getAll(page, limit);
      setFaculty(response.faculty);
      setPagination(prev => ({
        ...prev,
        faculty: {
          page: response.currentPage,
          limit: limit,
          totalItems: response.totalItems,
          totalPages: response.totalPages,
        }
      }));
    } catch (error) {
      console.error('Error fetching faculty:', error);
      showNotification('Failed to load faculty', 'error');
    }
  };

  const fetchStudents = async (page = 1, limit = 10) => {
    try {
      const response = await studentAPI.getAll(page, limit);
      setStudents(response.students);
      setPagination(prev => ({
        ...prev,
        students: {
          page: response.currentPage,
          limit: limit,
          totalItems: response.totalItems,
          totalPages: response.totalPages,
        }
      }));
    } catch (error) {
      console.error('Error fetching students:', error);
      showNotification('Failed to load students', 'error');
    }
  };

  const fetchSubjects = async (page = 1, limit = 10, filters = {}) => {
    try {
      const response = await subjectAPI.getAll(page, limit, filters);
      setSubjects(response.subjects);
      setPagination(prev => ({
        ...prev,
        subjects: {
          page: response.currentPage,
          limit: limit,
          totalItems: response.totalItems,
          totalPages: response.totalPages,
        }
      }));
    } catch (error) {
      console.error('Error fetching subjects:', error);
      showNotification('Failed to load subjects', 'error');
    }
  };

  const fetchDefaulters = async () => {
    try {
      const response = await reportsAPI.getDefaulters(attendanceThreshold);
      setDefaulters(response.defaulters);
    } catch (error) {
      console.error('Error fetching defaulters:', error);
    }
  };

  const fetchAttendanceThreshold = async () => {
    try {
      const threshold = await settingsAPI.getAttendanceThreshold();
      setAttendanceThreshold(threshold);
    } catch (error) {
      console.error('Error fetching attendance threshold:', error);
    }
  };

  // Fetch degrees
  const fetchDegrees = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/admin/degrees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDegrees(response.data.degrees || []);
    } catch (error) {
      console.error('Error fetching degrees:', error);
      showNotification('Failed to load degrees', 'error');
    }
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setActiveFilter(null);
  };

  const handleNavigateWithFilter = (departmentName) => {
    setCurrentPage("Subjects");
    setActiveFilter({ Department: departmentName });
  };
  
  const handleLogin = async (email, password) => {
    try {
      await authAPI.login(email, password);
      setIsAuthenticated(true);
      showNotification('Login successful!', 'success');
    } catch (error) {
      console.error('Login error:', error);
      showNotification(error.message || 'Login failed', 'error');
      throw error;
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setCurrentPage("Home");
    // Clear all data
    setDashboardStats({});
    setDepartments([]);
    setFaculty([]);
    setStudents([]);
    setSubjects([]);
    setDefaulters([]);
    setActiveFilter({});
    showNotification('Logged out successfully', 'success');
  };

  const viewSubjectDetails = (subject) => {
    setSelectedSubject(subject);
    setCurrentPage("SubjectDetails");
  };

  const handleBack = () => {
    if (currentPage === "SubjectDetails") setCurrentPage("Subjects");
    else if (currentPage === "AddEditStudent") setCurrentPage("Students");
    else if (currentPage === "Calendar") setCurrentPage("SubjectDetails");
    else navigateTo("Home");
  };

  const handleThresholdChange = async (newThreshold) => {
    try {
      await settingsAPI.updateAttendanceThreshold(newThreshold);
      setAttendanceThreshold(newThreshold);
      showNotification('Attendance threshold updated successfully', 'success');
    } catch (error) {
      console.error('Error updating threshold:', error);
      showNotification('Failed to update attendance threshold', 'error');
    }
  };

  // --- Data Management Handlers ---
  const handleAddSubject = async (newSubjectData) => {
    try {
      await subjectAPI.create(newSubjectData);
      await fetchSubjects();
      showNotification('Subject created successfully', 'success');
    } catch (error) {
      console.error('Error adding subject:', error);
      showNotification(error.message || 'Failed to create subject', 'error');
      throw error;
    }
  };

  const handleUpdateSubject = async (subjectId, updatedData) => {
    try {
      console.log('Updating subject with ID:', subjectId);
      console.log('Updated data:', updatedData);
      await subjectAPI.update(subjectId, updatedData);
      console.log('Subject update successful, refreshing data...');
      await fetchSubjects();
      showNotification('Subject updated successfully', 'success');
    } catch (error) {
      console.error('Error updating subject:', error);
      showNotification(error.message || 'Failed to update subject', 'error');
      throw error;
    }
  };
  
  const handleSaveStudent = async (studentId, updatedData) => {
    try {
      if (studentId) {
        await studentAPI.update(studentId, updatedData);
        showNotification('Student updated successfully', 'success');
      } else {
        await studentAPI.create(updatedData);
        showNotification('Student created successfully', 'success');
        // Redirect to students list after creating a new student
        navigateTo('Students');
      }
      await fetchStudents();
      await fetchDefaulters();
    } catch (error) {
      console.error('Error saving student:', error);
      showNotification(error.message || 'Failed to save student', 'error');
      throw error;
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Delete student?")) {
      try {
        await studentAPI.delete(studentId);
        await fetchStudents();
        await fetchDefaulters();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleAddFaculty = async (newFacultyData) => {
    try {
      await facultyAPI.create(newFacultyData);
      await fetchFaculty();
      showNotification('Faculty member created successfully', 'success');
    } catch (error) {
      console.error('Error adding faculty:', error);
      showNotification(error.message || 'Failed to create faculty member', 'error');
      throw error;
    }
  };

  const handleUpdateFaculty = async (facultyId, updatedData) => {
    try {
      await facultyAPI.update(facultyId, updatedData);
      await fetchFaculty();
      showNotification('Faculty member updated successfully', 'success');
    } catch (error) {
      console.error('Error updating faculty:', error);
      showNotification(error.message || 'Failed to update faculty member', 'error');
      throw error;
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    if (window.confirm("Delete faculty member?")) {
      try {
        await facultyAPI.delete(facultyId);
        await fetchFaculty();
        showNotification('Faculty member deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting faculty:', error);
        showNotification(error.message || 'Failed to delete faculty member', 'error');
      }
    }
  };

  const handleAddDepartment = async (departmentName) => {
    try {
      await departmentAPI.create(departmentName);
      await fetchDepartments();
      showNotification('Department created successfully', 'success');
    } catch (error) {
      console.error('Error adding department:', error);
      showNotification(error.message || 'Failed to create department', 'error');
      throw error;
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (window.confirm("Delete department?")) {
      try {
        await departmentAPI.delete(departmentId);
        await fetchDepartments();
        showNotification('Department deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting department:', error);
        if (error.message.includes('foreign key constraint')) {
          showNotification('Cannot delete department: It has associated students, subjects, or faculty members. Please remove them first.', 'error');
        } else {
          showNotification(error.message || 'Failed to delete department', 'error');
        }
      }
    }
  };

  // --- Pagination handlers ---
  const handlePageChange = async (entity, page) => {
    try {
      switch (entity) {
        case 'departments':
          await fetchDepartments(page, pagination.departments.limit);
          break;
        case 'faculty':
          await fetchFaculty(page, pagination.faculty.limit);
          break;
        case 'students':
          await fetchStudents(page, pagination.students.limit);
          break;
        case 'subjects':
          await fetchSubjects(page, pagination.subjects.limit);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error changing page for ${entity}:`, error);
    }
  };

  // Faculty Assignment Handlers
  const handleAssignSubjectToFaculty = async (facultyId, subjectId) => {
    try {
      await facultyAssignmentAPI.assignSubjectToFaculty(facultyId, subjectId);
      showNotification('Subject assigned to faculty successfully', 'success');
      
      // Refresh both faculty and subjects data to show updated assignments
      await Promise.all([
        fetchFaculty(pagination.faculty.currentPage, pagination.faculty.limit),
        fetchSubjects(pagination.subjects.currentPage, pagination.subjects.limit)
      ]);
    } catch (error) {
      console.error('Error assigning subject to faculty:', error);
      showNotification(error.message || 'Failed to assign subject to faculty', 'error');
      throw error;
    }
  };

  const handleRemoveSubjectFromFaculty = async (facultyId, subjectId) => {
    try {
      console.log('🔍 Attempting to remove subject from faculty:', { facultyId, subjectId });
      console.log('🔑 Current token:', localStorage.getItem('adminToken'));
      
      await facultyAssignmentAPI.removeSubjectFromFaculty(facultyId, subjectId);
      showNotification('Subject removed from faculty successfully', 'success');
      
      // Refresh faculty data to show updated assignments
      await fetchFaculty(pagination.faculty.currentPage, pagination.faculty.limit);
    } catch (error) {
      console.error('❌ Error removing subject from faculty:', error);
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        showNotification('Please log in again. Session may have expired.', 'error');
        handleLogout();
        return;
      }
      
      showNotification(error.message || 'Failed to remove subject from faculty', 'error');
      throw error;
    }
  };

  const handleGetFacultyAssignments = async (facultyId) => {
    try {
      return await facultyAssignmentAPI.getFacultyAssignments(facultyId);
    } catch (error) {
      console.error('Error getting faculty assignments:', error);
      showNotification(error.message || 'Failed to get faculty assignments', 'error');
      throw error;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      );
    }
   
    switch (currentPage) {
      case "Home":
        return <Home />;
      
      case "Subjects":
        return (
          <SubjectsList
            subjects={subjects}
            allDepartments={departments}
            allFaculty={faculty}
            onViewDetails={viewSubjectDetails}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            initialDepartmentFilter={activeFilter?.Department || ""}
            pagination={pagination.subjects}
            onPageChange={(page) => handlePageChange('subjects', page)}
          />
        );
      
      case "SubjectDetails":
        return <EnrolledStudents subject={selectedSubject} allStudents={students} onBack={() => navigateTo("Subjects")} />;
      
      case "Students":
        return <StudentsList 
          students={students} 
          onAdd={() => { setSelectedStudent(null); setCurrentPage("AddEditStudent"); }} 
          onEdit={(student) => { setSelectedStudent(student); setCurrentPage("AddEditStudent"); }} 
          onDelete={handleDeleteStudent}
          pagination={pagination.students}
          onPageChange={(page) => handlePageChange('students', page)}
        />;
      
      case "Faculty":
        return (
          <FacultyList
            faculty={faculty}
            onAddFaculty={handleAddFaculty}
            onUpdateFaculty={handleUpdateFaculty}
            onDeleteFaculty={handleDeleteFaculty}
            pagination={pagination.faculty}
            onPageChange={(page) => handlePageChange('faculty', page)}
            allDepartments={departments}
            allSubjects={subjects}
            onAssignSubjectToFaculty={handleAssignSubjectToFaculty}
            onRemoveSubjectFromFaculty={handleRemoveSubjectFromFaculty}
            onGetFacultyAssignments={handleGetFacultyAssignments}
          />
        );
      
      case "Departments":
        return <DepartmentPage 
          departments={departments} 
          degrees={degrees}
          onAdd={async ({ name, degree_id }) => {
            try {
              await departmentAPI.create({ name, degree_id });
              await fetchDepartments();
              showNotification('Department created successfully', 'success');
            } catch (error) {
              showNotification(error.message || 'Failed to create department', 'error');
              throw error;
            }
          }}
          onEdit={async ({ department_id, name, degree_id }) => {
            try {
              await departmentAPI.update(department_id, { name, degree_id });
              await fetchDepartments();
              showNotification('Department updated successfully', 'success');
            } catch (error) {
              showNotification(error.message || 'Failed to update department', 'error');
              throw error;
            }
          }}
          onDelete={handleDeleteDepartment} 
          onSelectDepartment={handleNavigateWithFilter}
          pagination={pagination.departments}
          onPageChange={(page) => handlePageChange('departments', page)}
        />;
      
      case "AddEditStudent":
        return <AddEditStudentForm 
          student={selectedStudent} 
          onSave={handleSaveStudent} 
          onBack={() => navigateTo("Students")} 
          allDepartments={departments}
        />;
      
      case "Defaulters":
        return <LowAttendance allStudents={defaulters} />;
        
      case "Calendar":
        return <Calendar subject={selectedSubject} student={selectedStudent} onBack={() => setCurrentPage("SubjectDetails")} />;
      
      case "FaceRegister":
        return <FaceRegister />;
        
      case "Settings":
        return <Settings 
          departments={departments}
          faculty={faculty}
          students={students}
          subjects={subjects}
          attendanceThreshold={attendanceThreshold}
          onThresholdChange={handleThresholdChange}
        />;

      case "Degree":
        return <DegreesManager />;

      case "DegreesManager":
        return <DegreesManager />;

      case "AdminActivityLog":
        return <AdminActivityLog />;

      case "FacultyManagement":
        return <FacultyManagement />;

      case "BulkEnrollStudents":
        return <BulkEnrollStudents />;

      case "CoreEnrollments":
        return <CoreEnrollments departments={departments} />;

      default:
        return <Home />;
    }
  };

  const getTitle = () => {
    switch (currentPage) {
      case "Home": return "Dashboard";
      case "Subjects": return "Subjects";
      case "SubjectDetails": return `Students in ${selectedSubject?.name}`;
      case "Students": return "Student List";
      case "Faculty": return "Faculty";
      case "Departments": return "Manage Departments";
      case "Defaulters": return "Defaulters List";
      case "FaceRegister": return "FaceRegister";
      case "Settings": return "Settings";
      case "AddEditStudent": return selectedStudent ? "Edit Student" : "Add Student";
      case "Calendar": return `Attendance for ${selectedStudent?.name}`;
      case "Degree": return "Degree";
      case "AdminActivityLog": return "Admin Activity Log";
      case "FacultyManagement": return "Faculty Management";
      case "BulkEnrollStudents": return "Bulk Enroll Students";
      case "CoreEnrollments": return "Core Enrollments";
      default: return "Dashboard";
    }
  };

  // --- Render Logic ---
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }
  // --- Render Logic ---
  let pageContent = null;
  switch (currentPage) {
    case 'Home':
      pageContent = <Home />;
      break;
    case 'Dashboard':
      pageContent = <Dashboard navigateTo={navigateTo} />;
      break;
    case 'Degree':
      pageContent = <DegreesManager />;
      break;
    case 'Departments':
      pageContent = <DepartmentPage 
        departments={departments} 
        degrees={degrees}
        onAdd={async ({ name, degree_id }) => {
          try {
            await departmentAPI.create({ name, degree_id });
            await fetchDepartments();
            showNotification('Department created successfully', 'success');
          } catch (error) {
            showNotification(error.message || 'Failed to create department', 'error');
            throw error;
          }
        }}
        onEdit={async ({ department_id, name, degree_id }) => {
          try {
            await departmentAPI.update(department_id, { name, degree_id });
            await fetchDepartments();
            showNotification('Department updated successfully', 'success');
          } catch (error) {
            showNotification(error.message || 'Failed to update department', 'error');
            throw error;
          }
        }}
        onDelete={handleDeleteDepartment} 
        onSelectDepartment={handleNavigateWithFilter}
        pagination={pagination.departments}
        onPageChange={(page) => handlePageChange('departments', page)}
      />;
      break;
    case 'Faculty':
      pageContent = (
        <FacultyList
          faculty={faculty}
          onAddFaculty={handleAddFaculty}
          onUpdateFaculty={handleUpdateFaculty}
          onDeleteFaculty={handleDeleteFaculty}
          pagination={pagination.faculty}
          onPageChange={(page) => handlePageChange('faculty', page)}
          allDepartments={departments}
          allSubjects={subjects}
          onAssignSubjectToFaculty={handleAssignSubjectToFaculty}
          onRemoveSubjectFromFaculty={handleRemoveSubjectFromFaculty}
          onGetFacultyAssignments={handleGetFacultyAssignments}
        />
      );
      break;
    case 'FacultyManagement':
      pageContent = <FacultyManagement />;
      break;
    case 'Subjects':
      pageContent = <SubjectsList
        subjects={subjects}
        allDepartments={departments}
        allFaculty={faculty}
        onViewDetails={viewSubjectDetails}
        onAddSubject={handleAddSubject}
        onUpdateSubject={handleUpdateSubject}
        initialDepartmentFilter={activeFilter?.Department || ""}
        pagination={pagination.subjects}
        onPageChange={(page) => handlePageChange('subjects', page)}
      />;
      break;
    case 'Students':
      pageContent = <StudentsList 
        students={students} 
        onAdd={() => { setSelectedStudent(null); setCurrentPage("AddEditStudent"); }} 
        onEdit={(student) => { setSelectedStudent(student); setCurrentPage("AddEditStudent"); }} 
        onDelete={handleDeleteStudent}
        pagination={pagination.students}
        onPageChange={(page) => handlePageChange('students', page)}
      />;
      break;
    case 'Enrollments':
      pageContent = <CoreEnrollments departments={departments} />;
      break;
    case 'Defaulters':
      pageContent = <LowAttendance allStudents={defaulters} />;
      break;
    case 'FaceRegister':
      pageContent = <FaceRegister />;
      break;
    case 'AdminActivityLog':
      pageContent = <AdminActivityLog />;
      break;
    case 'Settings':
      pageContent = <Settings 
        departments={departments}
        faculty={faculty}
        students={students}
        subjects={subjects}
        attendanceThreshold={attendanceThreshold}
        onThresholdChange={handleThresholdChange}
      />;
      break;
    // Prepare for System Health page
    case 'SystemHealth':
      pageContent = <SystemHealth />;
      break;
    default:
      pageContent = <Home />;
  }
  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <MainLayout
        currentPage={currentPage}
        navigateTo={navigateTo}
        title={getTitle()}
        showBackButton={!["Home", "Dashboard"].includes(currentPage)}
        onBack={handleBack}
        onLogout={handleLogout}
      >
        {pageContent}
      </MainLayout>
    </>
  );
}