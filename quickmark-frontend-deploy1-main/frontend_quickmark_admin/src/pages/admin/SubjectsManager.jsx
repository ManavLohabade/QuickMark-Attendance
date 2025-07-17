import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

export default function SubjectsManager() {
    const [departments, setDepartments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newSubject, setNewSubject] = useState({ subject_name: "", subject_code: "", department_id: "", year: "", section: "", semester: "1", batch_name: "" });
    const [editingSubject, setEditingSubject] = useState(null);
    const [editSubject, setEditSubject] = useState({ subject_id: "", subject_name: "", subject_code: "", department_id: "", year: "", section: "", semester: "1", batch_name: "" });

    const getAdminToken = () => localStorage.getItem("adminToken");

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const token = getAdminToken();
            const [deptRes, subjRes] = await Promise.all([
                axios.get("http://localhost:3700/api/admin/departments", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("http://localhost:3700/api/admin/subjects", { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setDepartments(deptRes.data);
            setSubjects(subjRes.data);
        } catch (err) {
            setError("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateSubject = async (e) => {
        e.preventDefault();
        setError("");
        if (!newSubject.subject_name.trim() || !newSubject.department_id || !newSubject.year || !newSubject.section) {
            setError("Subject name, department, year, and section are required.");
            return;
        }
        try {
            const token = getAdminToken();
            await axios.post(
                "http://localhost:3700/api/admin/subjects",
                {
                    subject_name: newSubject.subject_name,
                    subject_code: newSubject.subject_code,
                    department_id: newSubject.department_id,
                    year: parseInt(newSubject.year),
                    section: newSubject.section,
                    semester: parseInt(newSubject.semester),
                    batch_name: newSubject.batch_name.trim() || null,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewSubject({ subject_name: "", subject_code: "", department_id: "", year: "", section: "", semester: "1", batch_name: "" });
            fetchData();
        } catch (err) {
            setError("Failed to create subject.");
        }
    };

    const handleUpdateSubject = async (e) => {
        e.preventDefault();
        setError("");
        if (!editSubject.subject_name.trim() || !editSubject.department_id || !editSubject.year || !editSubject.section) {
            setError("Subject name, department, year, and section are required.");
            return;
        }
        try {
            const token = getAdminToken();
            await axios.put(
                `http://localhost:3700/api/admin/subjects/${editingSubject.subject_id}`,
                {
                    subject_name: editSubject.subject_name,
                    subject_code: editSubject.subject_code,
                    department_id: editSubject.department_id,
                    year: parseInt(editSubject.year),
                    section: editSubject.section,
                    semester: parseInt(editSubject.semester),
                    batch_name: editSubject.batch_name.trim() || null,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditingSubject(null);
            setEditSubject({ subject_id: "", subject_name: "", subject_code: "", department_id: "", year: "", section: "", semester: "1", batch_name: "" });
            fetchData();
        } catch (err) {
            setError("Failed to update subject.");
        }
    };

    const handleDeleteSubject = async (subjectId) => {
        if (!window.confirm("Are you sure you want to delete this subject?")) return;
        setError("");
        try {
            const token = getAdminToken();
            await axios.delete(
                `http://localhost:3700/api/admin/subjects/${subjectId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (err) {
            setError("Failed to delete subject.");
        }
    };

    return (
        <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-4 text-center">Subjects</h2>
            <form onSubmit={handleCreateSubject} className="mb-4 grid grid-cols-1 gap-2">
                <input
                    type="text"
                    placeholder="Subject Name"
                    value={newSubject.subject_name}
                    onChange={(e) => setNewSubject({ ...newSubject, subject_name: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                />
                <input
                    type="text"
                    placeholder="Subject Code"
                    value={newSubject.subject_code}
                    onChange={(e) => setNewSubject({ ...newSubject, subject_code: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                />
                <select
                    value={newSubject.department_id}
                    onChange={(e) => setNewSubject({ ...newSubject, department_id: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                        <option key={dept.department_id} value={dept.department_id}>
                            {dept.name}
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    placeholder="Year"
                    value={newSubject.year}
                    onChange={(e) => setNewSubject({ ...newSubject, year: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                />
                <input
                    type="text"
                    placeholder="Section"
                    value={newSubject.section}
                    onChange={(e) => setNewSubject({ ...newSubject, section: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                />
                <select
                    value={newSubject.semester}
                    onChange={(e) => setNewSubject({ ...newSubject, semester: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                </select>
                <input
                    type="text"
                    placeholder="Batch Name (Optional)"
                    value={newSubject.batch_name}
                    onChange={(e) => setNewSubject({ ...newSubject, batch_name: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                />
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center justify-center">
                    <PlusCircle size={20} className="mr-2" /> Add Subject
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
                            <th className="py-2 px-4 text-left">Dept.</th>
                            <th className="py-2 px-4 text-left">Year</th>
                            <th className="py-2 px-4 text-left">Section</th>
                            <th className="py-2 px-4 text-left">Batch</th>
                            <th className="py-2 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((subj) => (
                            <tr key={subj.subject_id} className="border-b last:border-b-0 hover:bg-gray-50">
                                <td className="py-2 px-4">{subj.subject_name}</td>
                                <td className="py-2 px-4">{departments.find(d => d.department_id === subj.department_id)?.name || "N/A"}</td>
                                <td className="py-2 px-4">{subj.year}</td>
                                <td className="py-2 px-4">{subj.section}</td>
                                <td className="py-2 px-4">{subj.batch_name || "N/A"}</td>
                                <td className="py-2 px-4 flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setEditingSubject(subj);
                                            setEditSubject({
                                                subject_id: subj.subject_id,
                                                subject_name: subj.subject_name,
                                                subject_code: subj.subject_code,
                                                department_id: subj.department_id,
                                                year: subj.year,
                                                section: subj.section,
                                                semester: subj.semester?.toString() || "1",
                                                batch_name: subj.batch_name,
                                            });
                                        }}
                                        className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"
                                        title="Edit"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSubject(subj.subject_id)}
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
            {editingSubject && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4 text-center">Edit Subject</h2>
                        <form onSubmit={handleUpdateSubject}>
                            <input
                                type="text"
                                value={editSubject.subject_name}
                                onChange={(e) => setEditSubject({ ...editSubject, subject_name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg mb-2"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Subject Code"
                                value={editSubject.subject_code}
                                onChange={(e) => setEditSubject({ ...editSubject, subject_code: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg mb-2"
                                required
                            />
                            <select
                                value={editSubject.department_id}
                                onChange={(e) => setEditSubject({ ...editSubject, department_id: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg mb-2"
                                required
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept.department_id} value={dept.department_id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="Year"
                                value={editSubject.year}
                                onChange={(e) => setEditSubject({ ...editSubject, year: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg mb-2"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Section"
                                value={editSubject.section}
                                onChange={(e) => setEditSubject({ ...editSubject, section: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg mb-2"
                                required
                            />
                            <select
                                value={editSubject.semester}
                                onChange={(e) => setEditSubject({ ...editSubject, semester: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg mb-2"
                                required
                            >
                                <option value="1">Semester 1</option>
                                <option value="2">Semester 2</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Batch Name (Optional)"
                                value={editSubject.batch_name || ""}
                                onChange={(e) => setEditSubject({ ...editSubject, batch_name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg mb-2"
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingSubject(null);
                                        setEditSubject({ subject_id: "", subject_name: "", subject_code: "", department_id: "", year: "", section: "", semester: "1", batch_name: "" });
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