import React, { useState } from 'react';
import Papa from 'papaparse';

export default function BulkEnrollStudents() {
  const [mode, setMode] = useState('single'); // 'single' or 'multi'
  const [subjectId, setSubjectId] = useState('');
  const [csvData, setCsvData] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle CSV upload and parse
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
      }
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    try {
      let response;
      if (mode === 'single') {
        const rollnos = csvData.map(row => row.rollno).filter(Boolean);
        response = await fetch(`${API_BASE_URL}/enrollments/bulk/single-subject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
          body: JSON.stringify({ subject_id: subjectId, rollnos }),
        });
      } else {
        const enrollments = csvData.map(row => ({ rollno: row.rollno, subject_id: row.subject_id })).filter(e => e.rollno && e.subject_id);
        response = await fetch(`${API_BASE_URL}/enrollments/bulk/multi-subject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
          body: JSON.stringify({ enrollments }),
        });
      }
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Bulk Enroll Students</h2>
      <div className="mb-4">
        <label>
          <input type="radio" checked={mode === 'single'} onChange={() => setMode('single')} />
          Single Subject
        </label>
        <label className="ml-4">
          <input type="radio" checked={mode === 'multi'} onChange={() => setMode('multi')} />
          Multiple Subjects
        </label>
      </div>
      <form onSubmit={handleSubmit}>
        {mode === 'single' && (
          <div className="mb-4">
            <label>Subject ID: </label>
            <input type="text" value={subjectId} onChange={e => setSubjectId(e.target.value)} required className="border px-2 py-1" />
          </div>
        )}
        <div className="mb-4">
          <label>Upload CSV: </label>
          <input type="file" accept=".csv" onChange={handleFileChange} required />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>
      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Results:</h3>
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Roll No</th>
                {mode === 'multi' && <th className="border px-2 py-1">Subject ID</th>}
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Error</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{r.rollno}</td>
                  {mode === 'multi' && <td className="border px-2 py-1">{r.subject_id}</td>}
                  <td className="border px-2 py-1">{r.status}</td>
                  <td className="border px-2 py-1">{r.error || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 