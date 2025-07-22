import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, Edit, Trash2, Search } from "lucide-react";
import { API_BASE_URL } from '../../utils/api';

export default function DegreesManager() {
    const [degrees, setDegrees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newDegreeName, setNewDegreeName] = useState("");
    const [editingDegree, setEditingDegree] = useState(null);
    const [editDegreeName, setEditDegreeName] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const getAdminToken = () => localStorage.getItem("adminToken");

    const fetchDegrees = async () => {
        setLoading(true);
        setError("");
        try {
            const token = getAdminToken();
            const response = await axios.get(`${API_BASE_URL}/admin/degrees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDegrees(response.data.degrees || []);
        } catch (err) {
            console.error('Error fetching degrees:', err);
            setError(err.response?.data?.message || "Failed to load degrees.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDegrees();
    }, []);

    const handleCreateDegree = async (e) => {
        e.preventDefault();
        setError("");
        if (!newDegreeName.trim()) {
            setError("Degree name is required.");
            return;
        }
        try {
            const token = getAdminToken();
            const response = await axios.post(
                `${API_BASE_URL}/admin/degrees`,
                { name: newDegreeName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Degree created:', response.data);
            setNewDegreeName("");
            setShowAddModal(false);
            fetchDegrees();
        } catch (err) {
            console.error('Error creating degree:', err);
            setError(err.response?.data?.message || "Failed to create degree.");
        }
    };

    const handleUpdateDegree = async (e) => {
        e.preventDefault();
        setError("");
        if (!editDegreeName.trim()) {
            setError("Degree name is required.");
            return;
        }
        try {
            const token = getAdminToken();
            const response = await axios.put(
                `${API_BASE_URL}/admin/degrees/${editingDegree.degree_id}`,
                { name: editDegreeName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Degree updated:', response.data);
            setEditingDegree(null);
            setEditDegreeName("");
            fetchDegrees();
        } catch (err) {
            console.error('Error updating degree:', err);
            setError(err.response?.data?.message || "Failed to update degree.");
        }
    };

    const handleDeleteDegree = async (degreeId) => {
        if (!window.confirm("Are you sure you want to delete this degree?")) return;
        setError("");
        try {
            const token = getAdminToken();
            const response = await axios.delete(
                `${API_BASE_URL}/admin/degrees/${degreeId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Degree deleted:', response.data);
            fetchDegrees();
        } catch (err) {
            console.error('Error deleting degree:', err);
            setError(err.response?.data?.message || "Failed to delete degree.");
        }
    };

    // Filter degrees based on search term
    const filteredDegrees = degrees.filter(deg => 
        deg.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 border rounded-lg shadow-sm bg-white">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Degrees</h2>
                <button 
                    onClick={() => setShowAddModal(true)} 
                    className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600 transition-colors"
                >
                    <PlusCircle size={20} className="mr-2" /> Add Degree
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search degrees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {error && <div className="text-red-500 mb-2">{error}</div>}
            
            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="py-2 px-4 text-left">Name</th>
                                <th className="py-2 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDegrees.map((deg) => (
                                <tr key={deg.degree_id} className="border-b last:border-b-0 hover:bg-gray-50">
                                    <td className="py-2 px-4">{deg.name}</td>
                                    <td className="py-2 px-4">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => {
                                                    setEditingDegree(deg);
                                                    setEditDegreeName(deg.name);
                                                }}
                                                className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"
                                                title="Edit"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDegree(deg.degree_id)}
                                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredDegrees.length === 0 && (
                                <tr>
                                    <td colSpan="2" className="py-4 text-center text-gray-500">
                                        {searchTerm ? "No degrees found matching your search." : "No degrees found."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Degree Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                        <h2 className="text-xl font-semibold mb-4">Add New Degree</h2>
                        <form onSubmit={handleCreateDegree}>
                            <input
                                type="text"
                                placeholder="Degree Name"
                                value={newDegreeName}
                                onChange={(e) => setNewDegreeName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setNewDegreeName("");
                                        setError("");
                                    }}
                                    className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Add Degree
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingDegree && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                        <h2 className="text-xl font-semibold mb-4">Edit Degree</h2>
                        <form onSubmit={handleUpdateDegree}>
                            <input
                                type="text"
                                value={editDegreeName}
                                onChange={(e) => setEditDegreeName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingDegree(null);
                                        setEditDegreeName("");
                                        setError("");
                                    }}
                                    className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 