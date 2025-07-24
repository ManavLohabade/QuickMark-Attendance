import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { dashboardAPI } from '../utils/api';

const COLORS = ['#34d399', '#f87171', '#fbbf24'];

export default function Home() {
  const [stats, setStats] = useState(null);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [studentsByDept, setStudentsByDept] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const statsRes = await dashboardAPI.getStats();
        setStats(statsRes);
        // Example: fetch attendance trend and students by department from backend if available
        // For now, use mock data for charts
        setAttendanceTrend([
          { month: 'Jan', attendance: 92 },
          { month: 'Feb', attendance: 89 },
          { month: 'Mar', attendance: 94 },
          { month: 'Apr', attendance: 91 },
          { month: 'May', attendance: 95 },
        ]);
        setStudentsByDept([
          { department: 'CSE', students: 120 },
          { department: 'ECE', students: 90 },
          { department: 'MECH', students: 60 },
          { department: 'CIVIL', students: 40 },
        ]);
        setAttendanceData([
          { name: 'Present', value: 320 },
          { name: 'Absent', value: 45 },
          { name: 'Late', value: 15 },
        ]);
      } catch (err) {
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const infoCards = stats ? [
    { label: 'Total Students', value: stats.students, color: 'bg-blue-100 text-blue-800' },
    { label: 'Total Faculty', value: stats.faculties, color: 'bg-green-100 text-green-800' },
    { label: 'Total Subjects', value: stats.subjects, color: 'bg-purple-100 text-purple-800' },
    { label: 'Attendance %', value: '92%', color: 'bg-yellow-100 text-yellow-800' },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-12 animate-fade-in">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-b-3xl shadow-lg mb-12 p-8 flex flex-col md:flex-row items-center justify-between animate-slide-down">
        <div className="text-white max-w-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">Welcome, Admin!</h1>
          <p className="text-lg md:text-2xl font-medium mb-2">Here’s a quick overview of your institution’s analytics.</p>
          <p className="text-md md:text-lg opacity-80">Track attendance, enrollment, and more at a glance. Use the sidebar to access detailed dashboards and management tools.</p>
        </div>
        <div className="mt-8 md:mt-0 md:ml-12">
          <PieChart width={180} height={180} className="drop-shadow-xl animate-pop-in">
            <Pie data={attendanceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {attendanceData.map((entry, index) => (
                <Cell key={`cell-hero-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </div>
      </div>
      {/* Main Analytics Section */}
      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="flex items-center gap-3"><span className="w-5 h-5 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span> Loading analytics...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {infoCards.map(card => (
                <div key={card.label} className={`rounded-xl shadow p-6 flex flex-col items-center ${card.color}`}>
                  <div className="text-3xl font-bold mb-2">{card.value}</div>
                  <div className="text-lg font-medium">{card.label}</div>
                </div>
              ))}
            </div>
            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
              {/* Large Bar Chart */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Students by Department</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studentsByDept} barSize={40}>
                    <XAxis dataKey="department" tick={{ fontSize: 16 }} />
                    <YAxis tick={{ fontSize: 16 }} />
                    <Tooltip />
                    <Bar dataKey="students" fill="url(#barGradient)" radius={[16,16,0,0]}>
                      {studentsByDept.map((entry, index) => (
                        <Cell key={`bar-cell-${index}`} fill={`url(#barGradient)`} />
                      ))}
                    </Bar>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#a5b4fc" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Large Line Chart */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 animate-fade-in-up delay-100">
                <h2 className="text-2xl font-bold mb-4 text-green-700">Attendance Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={attendanceTrend}>
                    <XAxis dataKey="month" tick={{ fontSize: 16 }} />
                    <YAxis tick={{ fontSize: 16 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={4} dot={{ r: 8 }} activeDot={{ r: 12 }} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Small Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Donut Chart */}
              <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center animate-fade-in-up delay-200">
                <h3 className="text-lg font-semibold mb-2 text-yellow-700">Attendance Donut</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={attendanceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label>
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-donut-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Mini Pie Chart */}
              <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center animate-fade-in-up delay-300">
                <h3 className="text-lg font-semibold mb-2 text-pink-700">Mini Attendance Pie</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={attendanceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-mini-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Quick Info Card */}
              <div className="bg-gradient-to-br from-green-200 via-blue-100 to-purple-100 rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center animate-fade-in-up delay-400">
                <div className="text-4xl font-extrabold text-blue-800 mb-2">92%</div>
                <div className="text-lg font-medium text-gray-700">Overall Attendance</div>
              </div>
            </div>
            {/* Recent Highlights Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 animate-fade-in-up delay-500">
              <h2 className="text-xl font-bold mb-4 text-purple-700">Recent Highlights</h2>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>5 new students enrolled this week</li>
                <li>Attendance improved by 3% compared to last month</li>
                <li>2 new faculty members joined</li>
                <li>Upcoming event: Annual Day on Aug 15</li>
              </ul>
            </div>
            {/* Quick Actions Section */}
            <div className="bg-gradient-to-r from-blue-100 via-green-100 to-yellow-100 rounded-2xl shadow-lg p-8 flex flex-wrap gap-6 items-center animate-fade-in-up delay-600">
              <h2 className="text-xl font-bold mb-4 text-blue-700 w-full">Quick Actions</h2>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-all">Add Student</button>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition-all">Add Faculty</button>
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-700 transition-all">View Reports</button>
              <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow hover:bg-yellow-600 transition-all">Download Data</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 