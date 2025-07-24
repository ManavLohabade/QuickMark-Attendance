const express = require('express');
const dotenv = require('dotenv');
const { pool, healthCheck } = require('./config/db');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3700;

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',    // React default
    'http://localhost:5173',    // Vite default (admin)
    'http://localhost:5174',    // Vite default (faculty)
    'http://localhost:5175',    // Vite default (faculty)
    'http://localhost:4173',    // Vite preview
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:4173',
    'https://quickmark-frontend-deploy1-4nlf.vercel.app', // Deployed frontend admin
    'https://quickmark-frontend-deploy1-f1wm.vercel.app', // Deployed frontend faculty
    'https://quickmark-frontend-deploy1-f1wm-eg8cpqbar.vercel.app',
    '*', // Deployed frontend admin
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Security Middleware
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Allow images to be served cross-origin

// Basic Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const degreeRoutes = require('./routes/degreeRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/degrees', degreeRoutes);

// Basic root route
app.get('/', (req, res) => {
    res.send('Welcome to the QuickMark API! 421 9 jul');
});

// Health check endpoint
app.get('/health', async (req, res) => {
    const dbHealthy = await healthCheck();
    res.status(dbHealthy ? 200 : 503).json({
        status: dbHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        database: dbHealthy ? 'connected' : 'disconnected'
    });
});

// Database Connection Test
pool.query('SELECT NOW()')
    .then(() => console.log('Successfully connected to PostgreSQL database!'))
    .catch(err => console.error('Error connecting to the database:', err));

// Error handling for file uploads
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            message: 'File size too large. Maximum size is 5MB.'
        });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            message: 'Unexpected field in file upload.'
        });
    }
    if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({
            message: err.message
        });
    }
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at: http://localhost:${PORT}/health`);
    console.log(`CORS enabled for origins: ${corsOptions.origin.join(', ')}`);
    console.log(`Uploads directory: ${path.join(__dirname, 'uploads')}`);
});