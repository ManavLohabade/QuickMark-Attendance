import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Filter, Printer, Upload } from 'lucide-react';
import Papa from 'papaparse';
import { API_BASE_URL } from '../../utils/api';

const API_URL = `${API_BASE_URL}/degrees`;

export default function Degree() {
  const [degrees, setDegrees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDegree, setEditingDegree] = useState(null);
  const [error, setError] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const printableContentRef = useRef(null);

  // Fetch all degrees
  const fetchDegrees = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setDegrees(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch degrees');
    }
  };

  useEffect(() => {
    fetchDegrees();
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search and filter logic (for future extensibility)
  const filteredDegrees = useMemo(() => {
    return degrees.filter(d => (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [degrees, searchTerm]);

  // Add/Edit Modal logic
  const handleSave = async (formData) => {
    try {
      if (editingDegree) {
        await fetch(`${API_URL}/${editingDegree.degree_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name })
        });
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name })
        });
      }
      setIsModalOpen(false);
      setEditingDegree(null);
      fetchDegrees();
    } catch (err) {
      setError('Failed to save degree');
    }
  };

  const handleDelete = async (degree_id) => {
    if (!window.confirm('Are you sure you want to delete this degree?')) return;
    try {
      await fetch(`${API_URL}/${degree_id}`, { method: 'DELETE' });
      fetchDegrees();
    } catch (err) {
      setError('Failed to delete degree');
    }
  };

  const handleAddClick = () => {
    setEditingDegree(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (degree) => {
    setEditingDegree(degree);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDegree(null);
  };

  // Print and Import (stub for now)
  const handlePrint = () => {
    const printContent = printableContentRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=800,width=800');
    printWindow.document.write('<html><head><title>Degree List</title>');
    printWindow.document.write('<style>body { font-family: sans-serif; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; } h1 { text-align: center; } .no-print { display: none; }</style></head><body>');
    printWindow.document.write('<h1>Degree List</h1>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          // Validate required fields
          const required = ['name'];
          const missing = results.data.filter(row => required.some(f => !row[f]));
          if (missing.length > 0) {
            alert('Some rows are missing required fields.');
            return;
          }
          try {
            // TODO: Replace with actual backend bulk-create endpoint
            await fetch(`${API_BASE_URL}/admin/degrees/bulk`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
              body: JSON.stringify({ degrees: results.data })
            });
            alert('Degrees imported successfully!');
            window.location.reload();
          } catch (err) {
            alert('Error importing degrees: ' + err.message);
          }
        },
        error: (err) => {
          alert('Error parsing file: ' + err.message);
        }
      });
    }
  };

  return (
    <>
      {isModalOpen && (
        <DegreeModal
          degree={editingDegree}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-xl font-semibold text-gray-800">Degrees</h3>
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileImport} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
              <button onClick={handleImportClick} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50"><Upload size={16}/> Import</button>
              <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50"><Printer size={16}/> Print</button>
              <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg></span>
                <input type="text" placeholder="Search by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="relative" ref={filterMenuRef}>
                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><Filter size={20} className="text-gray-600"/></button>
                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl p-4 z-20 border">
                    <h4 className="font-semibold mb-2">Filter Options</h4>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border rounded-md text-sm" placeholder="Search by name..." />
                    </div>
                  </div>
                )}
              </div>
              <button onClick={handleAddClick} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm">Add Degree</button>
            </div>
          </div>
          <div className="overflow-x-auto" ref={printableContentRef}>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4 text-right no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDegrees.map((d) => (
                  <tr key={d.degree_id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{d.name}</td>
                    <td className="py-3 px-4 text-right no-print">
                      <button onClick={() => handleEditClick(d)} className="text-blue-500 hover:underline font-semibold text-sm mr-4">Edit</button>
                      <button onClick={() => handleDelete(d.degree_id)} className="text-red-500 hover:underline font-semibold text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDegrees.length === 0 && <div className="text-center py-10"><p className="text-gray-500">No degrees found.</p></div>}
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      </div>
    </>
  );
}

// Modal for Add/Edit Degree
function DegreeModal({ degree, onClose, onSave }) {
  const [name, setName] = useState(degree ? degree.name : '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ name });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg min-w-[320px]">
        <h3 className="text-lg font-semibold mb-4">{degree ? 'Edit Degree' : 'Add Degree'}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Degree Name"
            required
            className="w-full p-2 border rounded mb-4"
          />
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded mr-2">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-green-500 text-white rounded">{saving ? 'Saving...' : degree ? 'Save' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
