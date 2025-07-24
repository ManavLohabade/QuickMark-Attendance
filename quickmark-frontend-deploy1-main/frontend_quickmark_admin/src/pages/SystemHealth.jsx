import React, { useEffect, useState } from 'react';
import { healthCheck } from '../utils/api';

export default function SystemHealth() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHealth = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await healthCheck();
      setStatus(res);
    } catch (err) {
      setError('Failed to fetch system health.');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  let color = 'bg-gray-300';
  if (status?.status === 'healthy') color = 'bg-green-400';
  else if (status?.status === 'unhealthy') color = 'bg-red-400';

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">System Health</h1>
      {loading ? (
        <div className="flex items-center gap-3"><span className="w-5 h-5 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span> Checking system health...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="rounded-xl shadow-lg p-8 flex flex-col items-center bg-white">
          <div className={`w-16 h-16 rounded-full mb-4 ${color} flex items-center justify-center text-3xl`}>
            {status?.status === 'healthy' ? '✅' : status?.status === 'unhealthy' ? '❌' : '❓'}
          </div>
          <div className="text-xl font-semibold mb-2">Backend Status: <span className={status?.status === 'healthy' ? 'text-green-600' : 'text-red-600'}>{status?.status || 'Unknown'}</span></div>
          <div className="text-lg mb-2">Database: <span className={status?.database === 'connected' ? 'text-green-600' : 'text-red-600'}>{status?.database || 'Unknown'}</span></div>
          <div className="text-gray-500 text-sm">Last checked: {status?.timestamp ? new Date(status.timestamp).toLocaleString() : '-'}</div>
          <button onClick={fetchHealth} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">Refresh</button>
        </div>
      )}
    </div>
  );
} 