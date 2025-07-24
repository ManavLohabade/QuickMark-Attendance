// src/pages/dashboard/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import InfoCard from './InfoCard.jsx';
import { dashboardAPI } from '../../utils/api';
import { GraduationCap, Building, Users, BookOpen, AlertTriangle, Activity, Camera, Settings, UserPlus, HeartPulse } from 'lucide-react';

const cardData = [
  { title: 'Total Degrees', key: 'degrees', IconComponent: GraduationCap, linkTo: 'Degree' },
  { title: 'Total Departments', key: 'departments', IconComponent: Building, linkTo: 'Departments' },
  { title: 'Total Faculty', key: 'faculties', IconComponent: Users, linkTo: 'Faculty' },
  { title: 'Total Subjects', key: 'subjects', IconComponent: BookOpen, linkTo: 'Subjects' },
  { title: 'Total Students', key: 'students', IconComponent: Users, linkTo: 'Students' },
  { title: 'Enrollments', key: '', IconComponent: UserPlus, linkTo: 'Enrollments' },
  { title: 'Total Defaulters', key: 'defaulters', IconComponent: AlertTriangle, linkTo: 'Defaulters' },
  { title: 'Activity Log', key: '', IconComponent: Activity, linkTo: 'AdminActivityLog' },
  { title: 'Faculty Management', key: '', IconComponent: Users, linkTo: 'FacultyManagement' },
  { title: 'Face Register', key: '', IconComponent: Camera, linkTo: 'FaceRegister' },
  { title: 'System Health', key: '', IconComponent: HeartPulse, linkTo: 'SystemHealth' },
  { title: 'Settings', key: '', IconComponent: Settings, linkTo: 'Settings' },
];

export default function Dashboard({ navigateTo }) {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    dashboardAPI.getStats()
      .then(data => {
        setStats(data);
        setError('');
      })
      .catch(err => {
        setError('Failed to load dashboard stats.');
        setStats({});
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
          {cardData.map((card, idx) => (
            <div className="animate-fade-in-up" style={{ animationDelay: `${idx * 60}ms` }} key={card.title}>
              <InfoCard
                title={card.title}
                value={card.key ? stats[card.key] ?? '--' : ''}
                navigate={navigateTo}
                linkTo={card.linkTo}
                IconComponent={card.IconComponent}
              />
            </div>
          ))}
        </div>
      )}
      {/* TODO: Add more dashboard widgets, recent activity, compact charts, etc. */}
    </div>
  );
}