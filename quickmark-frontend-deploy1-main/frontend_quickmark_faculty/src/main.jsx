import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/main.css'; // Import the global stylesheet
import App from './App';

// Create a root instance for rendering the React app
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the main App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
