import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Mail, Briefcase, Building2, ChevronDown, ChevronUp, ListChecks } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';

const cardColors = [
  'bg-gradient-to-br from-blue-100 to-blue-50',
  'bg-gradient-to-br from-green-100 to-green-50',
  'bg-gradient-to-br from-yellow-100 to-yellow-50',
  'bg-gradient-to-br from-purple-100 to-purple-50',
  'bg-gradient-to-br from-pink-100 to-pink-50',
];

const FacultyManagement = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({}); // faculty_id: true/false
  const [logs, setLogs] = useState({}); // faculty_id: [logs]
  const [logLoading, setLogLoading] = useState({}); // faculty_id: true/false
  const [error, setError] = useState('');

  // Fetch faculty list on mount
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/faculty`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        });
        setFacultyList(res.data.faculty || []);
      } catch (err) {
        setError('Failed to fetch faculty list.');
      }
    };
    fetchFaculties();
  }, []);

  // Filtered faculty list for autocomplete
  const filteredFaculty = facultyList.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase())
  );

  // Handle expand/collapse and fetch logs if needed
  const handleToggleExpand = async (faculty) => {
    setExpanded(prev => ({ ...prev, [faculty.faculty_id]: !prev[faculty.faculty_id] }));
    if (!logs[faculty.faculty_id] && !logLoading[faculty.faculty_id]) {
      setLogLoading(prev => ({ ...prev, [faculty.faculty_id]: true }));
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/faculty/${faculty.faculty_id}/activity-logs`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        });
        setLogs(prev => ({ ...prev, [faculty.faculty_id]: res.data || [] }));
      } catch (err) {
        setLogs(prev => ({ ...prev, [faculty.faculty_id]: [] }));
      } finally {
        setLogLoading(prev => ({ ...prev, [faculty.faculty_id]: false }));
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-primary flex items-center"><Users className="mr-2" /> Faculty Management</h2>
      <div className="mb-8">
        <label className="block font-medium mb-1">Search Faculty</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-2"
          placeholder="Type name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredFaculty.length === 0 && (
          <div className="col-span-full text-gray-500">No faculty found.</div>
        )}
        {filteredFaculty.map((faculty, idx) => (
          <div
            key={faculty.faculty_id}
            className={`rounded-xl shadow-lg p-6 flex flex-col items-center ${cardColors[idx % cardColors.length]}`}
          >
            <img
              src={faculty.photo_url || 'https://placehold.co/80x80/E2E8F0/4A5568?text=U'}
              alt="Profile"
              className="h-20 w-20 rounded-full border mb-4"
              onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80/E2E8F0/4A5568?text=U'; }}
            />
            <div className="font-bold text-lg mb-1 flex items-center"><Mail className="h-4 w-4 mr-1" /> {faculty.name}</div>
            <div className="text-gray-700 mb-1 flex items-center"><Mail className="h-4 w-4 mr-1" /> {faculty.email}</div>
            <div className="text-gray-700 mb-1 flex items-center"><Building2 className="h-4 w-4 mr-1" /> {faculty.department_name || 'N/A'}</div>
            <div className="text-gray-700 mb-3 flex items-center"><Briefcase className="h-4 w-4 mr-1" /> {faculty.designation || 'N/A'}</div>
            <button
              className="flex items-center bg-primary text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-primary-dark transition mb-2"
              onClick={() => handleToggleExpand(faculty)}
            >
              <ListChecks className="h-4 w-4 mr-2" />
              {expanded[faculty.faculty_id] ? 'Hide Activity Log' : 'View Activity Log'}
              {expanded[faculty.faculty_id] ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
            </button>
            {expanded[faculty.faculty_id] && (
              <div className="w-full mt-2 bg-white rounded-lg shadow-inner p-3 max-h-64 overflow-y-auto">
                {logLoading[faculty.faculty_id] ? (
                  <div>Loading logs...</div>
                ) : logs[faculty.faculty_id]?.length === 0 ? (
                  <div className="text-gray-500">No logs found for this faculty.</div>
                ) : (
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-2 py-1 text-left">Timestamp</th>
                        <th className="px-2 py-1 text-left">Action</th>
                        <th className="px-2 py-1 text-left">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs[faculty.faculty_id].map(log => (
                        <tr key={log.log_id} className="border-b">
                          <td className="px-2 py-1">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="px-2 py-1">{log.action}</td>
                          <td className="px-2 py-1">
                            <pre className="whitespace-pre-wrap break-all bg-gray-50 rounded p-1">{JSON.stringify(log.details, null, 2)}</pre>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacultyManagement; 