import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

export default function DepartmentsManager() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newDepartmentName, setNewDepartmentName] = useState("");
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [editDepartmentName, setEditDepartmentName] = useState("");

    const getAdminToken = () => localStorage.getItem("adminToken");

    const fetchDepartments = async () => {
        setLoading(true);
        setError("");
        try {
            const token = getAdminToken();
            const response = await axios.get("http://localhost:3700/api/admin/departments", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDepartments(response.data);
        } catch (err) {
            setError("Failed to load departments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleCreateDepartment = async (e) => {
        e.preventDefault();
        setError("");
        if (!newDepartmentName.trim()) {
            setError("Department name cannot be empty.");
            return;
        }
        try {
            const token = getAdminToken();
            await axios.post(
                "http://localhost:3700/api/admin/departments",
                { name: newDepartmentName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewDepartmentName("");
            fetchDepartments();
        } catch (err) {
            setError("Failed to create department.");
        }
    };

    const handleUpdateDepartment = async (e) => {
        e.preventDefault();
        setError("");
        if (!editDepartmentName.trim()) {
            setError("Department name cannot be empty.");
            return;
        }
        try {
            const token = getAdminToken();
            await axios.put(
                `http://localhost:3700/api/admin/departments/${editingDepartment.department_id}`,
                { name: editDepartmentName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditingDepartment(null);
            setEditDepartmentName("");
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
                `http://localhost:3700/api/admin/departments/${departmentId}`,
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
            <form onSubmit={handleCreateDepartment} className="mb-4 flex space-x-2">
                <input
                    type="text"
                    placeholder="Department Name"
                    value={newDepartmentName}
                    onChange={(e) => setNewDepartmentName(e.target.value)}
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
                            <th className="py-2 px-4 text-left">ID</th>
                            <th className="py-2 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((dept) => (
                            <tr key={dept.department_id} className="border-b last:border-b-0 hover:bg-gray-50">
                                <td className="py-2 px-4">{dept.name}</td>
                                <td className="py-2 px-4 text-xs text-gray-500">{dept.department_id}</td>
                                <td className="py-2 px-4 flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setEditingDepartment(dept);
                                            setEditDepartmentName(dept.name);
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
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingDepartment(null);
                                        setEditDepartmentName("");
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