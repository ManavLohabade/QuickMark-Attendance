import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

export default function DegreesManager() {
    const [degrees, setDegrees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newDegreeName, setNewDegreeName] = useState("");
    const [editingDegree, setEditingDegree] = useState(null);
    const [editDegreeName, setEditDegreeName] = useState("");

    const getAdminToken = () => localStorage.getItem("adminToken");

    const fetchDegrees = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.get("https://quickmark-backend-deploy1.onrender.com/api/degrees");
            setDegrees(response.data);
        } catch (err) {
            setError("Failed to load degrees.");
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
            await axios.post(
                "https://quickmark-backend-deploy1.onrender.com/api/admin/degrees",
                { name: newDegreeName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewDegreeName("");
            fetchDegrees();
        } catch (err) {
            setError("Failed to create degree.");
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
            await axios.put(
                `https://quickmark-backend-deploy1.onrender.com/api/admin/degrees/${editingDegree.degree_id}`,
                { name: editDegreeName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditingDegree(null);
            setEditDegreeName("");
            fetchDegrees();
        } catch (err) {
            setError("Failed to update degree.");
        }
    };

    const handleDeleteDegree = async (degreeId) => {
        if (!window.confirm("Are you sure you want to delete this degree?")) return;
        setError("");
        try {
            const token = getAdminToken();
            await axios.delete(
                `https://quickmark-backend-deploy1.onrender.com/api/admin/degrees/${degreeId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchDegrees();
        } catch (err) {
            setError("Failed to delete degree.");
        }
    };

    return (
        <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-4 text-center">Degrees</h2>
            <form onSubmit={handleCreateDegree} className="mb-4 flex space-x-2">
                <input
                    type="text"
                    placeholder="Degree Name"
                    value={newDegreeName}
                    onChange={(e) => setNewDegreeName(e.target.value)}
                    className="flex-grow px-4 py-2 border rounded-lg"
                    required
                />
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center">
                    <PlusCircle size={20} className="mr-2" /> Add
                </button>
            </form>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            {loading ? (
                <div>Loading...</div>
            ) : (
                <table className="min-w-full bg-white border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="py-2 px-4 text-left">Name</th>
                            <th className="py-2 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {degrees.map((deg) => (
                            <tr key={deg.degree_id} className="border-b last:border-b-0 hover:bg-gray-50">
                                <td className="py-2 px-4">{deg.name}</td>
                                <td className="py-2 px-4 flex space-x-2">
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
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                                className="w-full px-3 py-2 border rounded-lg mb-4"
                                required
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingDegree(null);
                                        setEditDegreeName("");
                                    }}
                                    className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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