import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

export default function DepartmentsManager() {
    const [departments, setDepartments] = useState([]);
    const [degrees, setDegrees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newDepartmentName, setNewDepartmentName] = useState("");
    const [newDepartmentDegree, setNewDepartmentDegree] = useState("");
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [editDepartmentName, setEditDepartmentName] = useState("");
    const [editDepartmentDegree, setEditDepartmentDegree] = useState("");
    const [degreeFilter, setDegreeFilter] = useState("");

    const getAdminToken = () => localStorage.getItem("adminToken");

    const fetchDegrees = async () => {
        try {
            const response = await axios.get("https://quickmark-backend-deploy1.onrender.com/api/degrees");
            setDegrees(response.data);
        } catch (err) {
            setError("Failed to load degrees.");
        }
    };

    const fetchDepartments = async (degreeId = "") => {
        setLoading(true);
        setError("");
        try {
            const token = getAdminToken();
            let url = "https://quickmark-backend-deploy1.onrender.com/api/admin/departments";
            if (degreeId) {
                url += `?degree_id=${degreeId}`;
            }
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDepartments(response.data.departments || response.data);
        } catch (err) {
            setError("Failed to load departments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDegrees();
        fetchDepartments();
    }, []);

    const handleDegreeFilterChange = (e) => {
        const value = e.target.value;
        setDegreeFilter(value);
        fetchDepartments(value);
    };

    const handleCreateDepartment = async (e) => {
        e.preventDefault();
        setError("");
        if (!newDepartmentName.trim() || !newDepartmentDegree) {
            setError("Department name and degree are required.");
            return;
        }
        try {
            const token = getAdminToken();
            await axios.post(
                "https://quickmark-backend-deploy1.onrender.com/api/admin/departments",
                { name: newDepartmentName, degree_id: newDepartmentDegree },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewDepartmentName("");
            setNewDepartmentDegree("");
            fetchDepartments();
        } catch (err) {
            setError("Failed to create department.");
        }
    };

    const handleUpdateDepartment = async (e) => {
        e.preventDefault();
        setError("");
        if (!editDepartmentName.trim() || !editDepartmentDegree) {
            setError("Department name and degree are required.");
            return;
        }
        try {
            const token = getAdminToken();
            await axios.put(
                `https://quickmark-backend-deploy1.onrender.com/api/admin/departments/${editingDepartment.department_id}`,
                { name: editDepartmentName, degree_id: editDepartmentDegree },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditingDepartment(null);
            setEditDepartmentName("");
            setEditDepartmentDegree("");
            fetchDepartments();
        } catch (err) {
            setError("Failed to update department.");
        }
    };

    const handleDeleteDepartment = async (departmentId) => {
        if (!window.confirm("Are you sure you want to delete this department?")) return;
        setError("");
        try {
            const token = getAdminToken();
            await axios.delete(
                `https://quickmark-backend-deploy1.onrender.com/api/admin/departments/${departmentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchDepartments();
        } catch (err) {
            setError("Failed to delete department.");
        }
    };

    return (
        <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-4 text-center">Departments</h2>
            <div className="mb-4 flex space-x-2 items-center">
                <label className="font-medium">Filter by Degree:</label>
                <select
                    value={degreeFilter}
                    onChange={handleDegreeFilterChange}
                    className="px-4 py-2 border rounded-lg"
                >
                    <option value="">All Degrees</option>
                    {degrees.map(deg => (
                        <option key={deg.degree_id} value={deg.degree_id}>{deg.name}</option>
                    ))}
                </select>
            </div>
            <form onSubmit={handleCreateDepartment} className="mb-4 flex space-x-2">
                <input
                    type="text"
                    placeholder="Department Name"
                    value={newDepartmentName}
                    onChange={(e) => setNewDepartmentName(e.target.value)}
                    className="flex-grow px-4 py-2 border rounded-lg"
                    required
                />
                <select
                    value={newDepartmentDegree}
                    onChange={e => setNewDepartmentDegree(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                    required
                >
                    <option value="">Select Degree</option>
                    {degrees.map(deg => (
                        <option key={deg.degree_id} value={deg.degree_id}>{deg.name}</option>
                    ))}
                </select>
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
                            <th className="py-2 px-4 text-left">Degree</th>
                            <th className="py-2 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((dept) => (
                            <tr key={dept.department_id} className="border-b last:border-b-0 hover:bg-gray-50">
                                <td className="py-2 px-4">{dept.name}</td>
                                <td className="py-2 px-4 text-xs text-gray-700">
                                    {degrees.find(d => d.degree_id === dept.degree_id)?.name || '—'}
                                </td>
                                <td className="py-2 px-4 flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setEditingDepartment(dept);
                                            setEditDepartmentName(dept.name);
                                            setEditDepartmentDegree(dept.degree_id);
                                        }}
                                        className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"
                                        title="Edit"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDepartment(dept.department_id)}
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
            {editingDepartment && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                        <h2 className="text-xl font-semibold mb-4">Edit Department</h2>
                        <form onSubmit={handleUpdateDepartment}>
                            <input
                                type="text"
                                value={editDepartmentName}
                                onChange={(e) => setEditDepartmentName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg mb-4"
                                required
                            />
                            <select
                                value={editDepartmentDegree}
                                onChange={e => setEditDepartmentDegree(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg mb-4"
                                required
                            >
                                <option value="">Select Degree</option>
                                {degrees.map(deg => (
                                    <option key={deg.degree_id} value={deg.degree_id}>{deg.name}</option>
                                ))}
                            </select>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingDepartment(null);
                                        setEditDepartmentName("");
                                        setEditDepartmentDegree("");
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