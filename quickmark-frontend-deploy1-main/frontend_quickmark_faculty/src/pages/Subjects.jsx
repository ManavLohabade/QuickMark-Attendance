import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronRight, Filter, X, Search } from 'lucide-react';

// --- Filter Dropdown Sub-Component (No changes needed here) ---
const FilterDropdown = ({ subjects, activeFilters, onFilterChange, onClear, onClose }) => {
    const dropdownRef = useRef(null);

    const filterOptions = useMemo(() => {
        const years = [...new Set(subjects.map(s => s.year))].sort();
        const departments = [...new Set(subjects.map(s => s.department))].sort();
        const sections = [...new Set(subjects.map(s => s.section))].sort();
        return { years, departments, sections };
    }, [subjects]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef, onClose]);

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        onFilterChange(name, value);
    };

    return (
        <div ref={dropdownRef} className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border z-10 p-4">
            <h4 className="font-semibold mb-4">Filter Subjects</h4>
            
            {/* Year Filter */}
            <div className="mb-4">
                <label htmlFor="year" className="block text-sm font-medium text-text-secondary mb-1">Year</label>
                <select name="year" id="year" value={activeFilters.year} onChange={handleSelectChange} className="w-full p-2 border border-border-color rounded-md">
                    <option value="">All Years</option>
                    {filterOptions.years.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
            </div>

            {/* Department Filter */}
            <div className="mb-4">
                <label htmlFor="department" className="block text-sm font-medium text-text-secondary mb-1">Department</label>
                <select name="department" id="department" value={activeFilters.department} onChange={handleSelectChange} className="w-full p-2 border border-border-color rounded-md">
                    <option value="">All Departments</option>
                    {filterOptions.departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </select>
            </div>

            {/* Section Filter */}
            <div className="mb-4">
                <label htmlFor="section" className="block text-sm font-medium text-text-secondary mb-1">Section</label>
                <select name="section" id="section" value={activeFilters.section} onChange={handleSelectChange} className="w-full p-2 border border-border-color rounded-md">
                    <option value="">All Sections</option>
                    {filterOptions.sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                </select>
            </div>

            <button onClick={onClear} className="w-full text-sm text-primary hover:underline">Clear All Filters</button>
        </div>
    );
};


// --- Main Subjects Component ---
const Subjects = ({ subjects, onSelectSubject }) => {
    // ✨ 1. Add state for the search term
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        year: '',
        department: '',
        section: ''
    });

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const clearFilters = () => {
        setFilters({ year: '', department: '', section: '' });
    };

    // ✨ 2. Update filtering logic to include the search term
    const filteredSubjects = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return subjects.filter(subject => {
            const matchesSearch = subject.name.toLowerCase().includes(term) ||
                                  subject.batchName.toLowerCase().includes(term);

            const matchesFilters = (filters.year ? subject.year == filters.year : true) &&
                                   (filters.department ? subject.department === filters.department : true) &&
                                   (filters.section ? subject.section === filters.section : true);

            return matchesSearch && matchesFilters;
        });
    }, [subjects, filters, searchTerm]);

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-text-primary">Subjects</h2>
                    <p className="text-text-secondary mt-1">Click on a subject to view student details and attendance.</p>
                </div>
                {/* ✨ 3. Container for search and filter controls */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="relative">
                        <button 
                            onClick={() => setShowFilters(!showFilters)} 
                            className="flex items-center px-4 py-2 border border-border-color rounded-lg text-text-secondary hover:bg-gray-50"
                        >
                            <Filter size={18} className="mr-2"/>
                            Filter
                        </button>
                        {showFilters && (
                            <FilterDropdown 
                                subjects={subjects} 
                                activeFilters={filters}
                                onFilterChange={handleFilterChange}
                                onClear={clearFilters}
                                onClose={() => setShowFilters(false)}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Subjects List Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Subject Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Year</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Section</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                             {/* ✨ 4. Add an empty state message */}
                            {filteredSubjects.length > 0 ? (
                                filteredSubjects.map((subject) => (
                                    <tr 
                                        key={subject.id} 
                                        className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                                        onClick={() => onSelectSubject(subject)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-text-primary">{subject.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-text-secondary">{subject.year}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-text-secondary">{subject.section}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-text-secondary">{subject.department}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <ChevronRight size={20} className="text-gray-400"/>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-gray-500">
                                        No subjects found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Subjects;