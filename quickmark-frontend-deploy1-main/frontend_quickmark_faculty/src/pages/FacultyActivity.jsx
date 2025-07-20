import React, { useEffect, useState } from "react";
import axios from "axios";

const FacultyActivity = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get("/api/faculty/activity-logs", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => {
      // If the response is an array, use it; if it's an object, try to extract the array
      if (Array.isArray(res.data)) {
        setLogs(res.data);
      } else if (Array.isArray(res.data.logs)) {
        setLogs(res.data.logs);
      } else {
        setLogs([]);
      }
    })
    .catch(err => {
      setLogs([]);
      console.error(err);
    });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Activity Log</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2">Time</th>
            <th className="px-4 py-2">Action</th>
            <th className="px-4 py-2">Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-4 text-gray-500">No activity logs found.</td>
            </tr>
          ) : (
            logs.map(log => (
              <tr key={log.log_id}>
                <td className="border px-4 py-2">{new Date(log.created_at).toLocaleString()}</td>
                <td className="border px-4 py-2">{log.action}</td>
                <td className="border px-4 py-2">
                  <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FacultyActivity;