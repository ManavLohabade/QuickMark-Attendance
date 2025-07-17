// src/pages/settings/Settings.jsx
import React from 'react';

// --- 1. Receive props from App.jsx ---
export default function Settings({ departments, faculty, students, subjects, attendanceThreshold, onThresholdChange }) {

    // --- 2. Implement the backup function ---
    const handleBackup = () => {
        // Create a backup object with all the data
        const backupData = {
            departments,
            faculty,
            students,
            subjects,
            attendanceThreshold,
            timestamp: new Date().toISOString()
        };
        
        // Create a JSON string from the backup data
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(backupData, null, 2)
        )}`;
        
        // Create a temporary link element to trigger the download
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `quickmark_backup_${new Date().toISOString()}.json`;
        link.click();
        
        alert("Backup download initiated!");
    };

    // --- 3. Implement the master print function ---
    const handlePrintMasterSheet = () => {
        const printWindow = window.open('', '', 'height=800,width=800');
        
        printWindow.document.write('<html><head><title>Master Attendance Sheet</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
            body { font-family: sans-serif; margin: 2rem; }
            .page-break { page-break-before: always; }
            .subject-header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            h1, h2 { text-align: center; }
            h2 { margin-top: 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write('<h1>Master Attendance Sheet</h1>');

        subjects.forEach((subject, index) => {
            if (index > 0) {
                // Add a page break before each new subject except the first one
                printWindow.document.write('<div class="page-break"></div>');
            }
            
            // Find students enrolled in this subject
            const enrolledStudents = students.filter(
                student => student.department === subject.department && student.startYear === subject.startYear
            );

            // Write subject header
            printWindow.document.write(`<div class="subject-header"><h2>${subject.name}</h2>`);
            printWindow.document.write(`<p><strong>Department:</strong> ${subject.department} | <strong>Faculty:</strong> ${subject.faculty}</p></div>`);
            
            // Write table for enrolled students
            printWindow.document.write('<table>');
            printWindow.document.write('<thead><tr><th>Roll No.</th><th>Student Name</th><th>Attendance</th></tr></thead><tbody>');
            
            if (enrolledStudents.length > 0) {
                enrolledStudents.forEach(student => {
                    printWindow.document.write(`<tr><td>${student.rollNo}</td><td>${student.name}</td><td>${student.attendance}%</td></tr>`);
                });
            } else {
                printWindow.document.write('<tr><td colspan="3" style="text-align: center;">No students enrolled.</td></tr>');
            }
            
            printWindow.document.write('</tbody></table>');
        });

        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-8 text-gray-800">Settings</h3>
            <div className="space-y-6">
                {/* Backup Data Section */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg gap-4">
                    <div>
                        <h4 className="font-semibold text-gray-800">Backup Data</h4>
                        <p className="text-sm text-gray-500 mt-1">Download a backup of all application data as a JSON file.</p>
                    </div>
                    {/* Attach the handler to the button */}
                    <button onClick={handleBackup} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 w-full sm:w-auto">
                        Backup
                    </button>
                </div>
                 {/* Print Master Sheet Section */}
                 <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg gap-4">
                    <div>
                        <h4 className="font-semibold text-gray-800">Print Master Attendance Sheet</h4>
                        <p className="text-sm text-gray-500 mt-1">Generate and print a master sheet for all subjects.</p>
                    </div>
                    {/* Attach the handler to the button */}
                    <button onClick={handlePrintMasterSheet} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 w-full sm:w-auto">
                        Print
                    </button>
                </div>
                 {/* Attendance Threshold Section */}
                 <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg gap-4">
                    <div>
                        <h4 className="font-semibold text-gray-800">Change Attendance Threshold</h4>
                        <p className="text-sm text-gray-500 mt-1">Set the minimum attendance percentage for defaulters.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* --- 4. Connect the input to the state and handler from App.jsx --- */}
                        <input 
                            type="number" 
                            value={attendanceThreshold}
                            onChange={(e) => onThresholdChange(e.target.value)}
                            className="w-20 p-2 border rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <span className="font-bold text-lg text-gray-700">%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}