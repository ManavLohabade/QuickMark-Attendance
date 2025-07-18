import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, User, Activity, Database, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function AdminActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    admin_id: '',
    start_date: '',
    end_date: '',
    limit: 100
  });

  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'create', label: 'Create' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'bulk_import', label: 'Bulk Import' }
  ];

  const entityOptions = [
    { value: '', label: 'All Entities' },
    { value: 'student', label: 'Student' },
    { value: 'faculty', label: 'Faculty' },
    { value: 'subject', label: 'Subject' },
    { value: 'department', label: 'Department' },
    { value: 'degree', label: 'Degree' }
  ];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(
        `https://quickmark-backend-deploy1.onrender.com/api/admin/audit-logs?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      entity: '',
      admin_id: '',
      start_date: '',
      end_date: '',
      limit: 100
    });
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'create': return <span className="text-green-600">✓</span>;
      case 'update': return <span className="text-blue-600">✎</span>;
      case 'delete': return <span className="text-red-600">🗑</span>;
      case 'bulk_import': return <span className="text-purple-600">📥</span>;
      default: return <span className="text-gray-600">•</span>;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'bulk_import': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Activity Log</h1>
          <p className="text-gray-600">Track and monitor all administrative actions across the system</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {actionOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Entity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entity</label>
              <select
                value={filters.entity}
                onChange={(e) => handleFilterChange('entity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {entityOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Admin ID Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
              <input
                type="text"
                value={filters.admin_id}
                onChange={(e) => handleFilterChange('admin_id', e.target.value)}
                placeholder="Enter admin ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
              <input
                type="number"
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', e.target.value)}
                min="1"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 items-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Apply Filters
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
              <button
                onClick={fetchLogs}
                disabled={loading}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No activity logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log, index) => (
                    <tr key={log.log_id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTimestamp(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {log.admin_id || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-gray-400" />
                          {log.entity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.entity_id || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs">
                          {log.details ? (
                            <details className="cursor-pointer">
                              <summary className="text-blue-600 hover:text-blue-800">
                                View Details
                              </summary>
                              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          ) : (
                            <span className="text-gray-400">No details</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {logs.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Logs</p>
                  <p className="text-lg font-semibold text-gray-900">{logs.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </span>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Creates</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {logs.filter(log => log.action === 'create').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">✎</span>
                </span>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Updates</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {logs.filter(log => log.action === 'update').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center">
                <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">🗑</span>
                </span>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Deletes</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {logs.filter(log => log.action === 'delete').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 