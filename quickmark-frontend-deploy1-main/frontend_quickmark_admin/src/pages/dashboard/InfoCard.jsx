import React from 'react';
import { ChevronRight } from 'lucide-react';

// Restore previous per-card gradient mapping
const cardGradients = {
  'Total Departments': {
    gradient: 'linear-gradient(135deg, #fceabb 0%, #f857a6 100%)',
    text: '#231123',
  },
  'Total Subjects': {
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    text: '#231123',
  },
  'Total Students': {
    gradient: 'linear-gradient(135deg, #21d4fd 0%, #b721ff 100%)',
    text: '#231123',
  },
  'Total Defaulters': {
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    text: '#231123',
  },
  'Total Faculty': {
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    text: '#231123',
  },
  'Settings': {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    text: '#fff',
  },
};

export default function InfoCard({ title, value, navigate, linkTo, IconComponent }) {
  const { gradient, text } = cardGradients[title] || {
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    text: '#231123',
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const handleCardClick = () => {
    if (linkTo && navigate) {
      navigate(linkTo);
    }
  };

  return (
    <div
      className={`p-6 rounded-2xl shadow-lg flex flex-col justify-between transition-all duration-200 cursor-pointer backdrop-blur-md`}
      style={{
        background: gradient,
        color: text,
        boxShadow: isHovered ? '0 8px 32px 0 rgba(31, 38, 135, 0.18)' : '0 4px 16px 0 rgba(31, 38, 135, 0.10)',
        border: '1px solid rgba(255,255,255,0.18)',
        opacity: isHovered ? 0.96 : 1,
      }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold" style={{ color: text }}>{title}</h3>
        {IconComponent && React.createElement(IconComponent, { size: 28, style: { color: text } })}
      </div>
      <p className="text-4xl font-bold mb-4" style={{ color: text }}>{value}</p>
      <button 
        onClick={handleCardClick}
        className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
        style={{
          background: 'rgba(255,255,255,0.7)',
          color: '#111',
          border: 'none',
          backdropFilter: 'blur(4px)',
        }}
      >
        View All
        <ChevronRight size={18} style={{ color: '#111' }} />
      </button>
    </div>
  );
}