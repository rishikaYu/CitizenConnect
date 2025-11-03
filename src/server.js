import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';


import { pool } from "./config/database.js";



// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Define PORT and HOST
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || 'localhost';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================
// MIDDLEWARE SETUP
// ========================

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================
// STATIC FILE SERVING - FIXED
// ========================

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory:', uploadsDir);
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  }
}));

console.log('📁 Static files serving from:', uploadsDir);

// ========================
// DEBUG ROUTES
// ========================
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Debug route to check uploads directory
app.get('/api/debug-uploads', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const fileDetails = files.map(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `http://localhost:5001/uploads/${file}`,
        accessible: true
      };
    });
    
    res.json({
      directory: uploadsDir,
      exists: true,
      totalFiles: files.length,
      files: fileDetails
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Cannot read uploads directory',
      message: error.message,
      path: uploadsDir
    });
  }
});

// Check specific file
app.get('/api/debug-file/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadsDir, filename);
  
  const exists = fs.existsSync(filePath);
  
  console.log('🔍 File check:', {
    filename,
    filePath,
    exists,
    uploadsDir
  });
  
  if (exists) {
    const stats = fs.statSync(filePath);
    res.json({
      exists: true,
      filename: filename,
      path: filePath,
      size: stats.size,
      created: stats.birthtime,
      url: `http://localhost:5001/uploads/${filename}`,
      accessible: true
    });
  } else {
    res.json({
      exists: false,
      filename: filename,
      path: filePath,
      message: 'File not found in uploads directory',
      uploadsDir: uploadsDir
    });
  }
});

// Test static file serving
app.get('/api/test-static', (req, res) => {
  res.json({
    message: 'Static file serving test',
    uploadsDirectory: uploadsDir,
    staticRoute: '/uploads',
    exampleUrl: 'http://localhost:5001/uploads/filename.jpg',
    currentFiles: fs.readdirSync(uploadsDir)
  });
});

// ========================
// ROUTE IMPORTS
// ========================

// Import your routes
import authRoutes from './routes/auth.js';
import citizenRoutes from './routes/citizen.js';
import adminRoutes from './routes/admin.js';
import { authenticateToken } from './middleware/auth.js';
import { authorizeAdmin } from './middleware/authorize.js';

// ========================
// ROUTE REGISTRATION
// ========================

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/citizen', authenticateToken, citizenRoutes);
app.use('/api/admin', authenticateToken, authorizeAdmin, adminRoutes);

// ========================
// BASIC ROUTES
// ========================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    staticFiles: {
      uploads: '/uploads',
      directory: uploadsDir,
      totalFiles: fs.readdirSync(uploadsDir).length
    }
  });
});

// Test endpoints
app.get('/api/test/auth', (req, res) => {
  res.json({ 
    message: 'Auth routes are working',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/verify'
    ]
  });
});

app.get('/api/test/citizen', (req, res) => {
  res.json({ 
    message: 'Citizen routes are working',
    endpoints: [
      'GET /api/citizen/stats',
      'GET /api/citizen/requests',
      'POST /api/citizen/requests'
    ]
  });
});

app.get('/api/test/admin', (req, res) => {
  res.json({ 
    message: 'Admin routes are working',
    endpoints: [
      'GET /api/admin/stats',
      'GET /api/admin/requests',
      'PUT /api/admin/requests/:id/status'
    ]
  });
});

// CORS test endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({
    message: 'CORS is working correctly!',
    yourOrigin: req.headers.origin,
    allowedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Citizen App API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      citizen: '/api/citizen',
      admin: '/api/admin',
      debug: {
        uploads: '/api/debug-uploads',
        file: '/api/debug-file/:filename',
        static: '/api/test-static'
      },
      test: {
        auth: '/api/test/auth',
        citizen: '/api/test/citizen',
        admin: '/api/test/admin',
        cors: '/api/test-cors'
      }
    },
    staticFiles: {
      route: '/uploads',
      directory: uploadsDir
    }
  });
});

// ========================
// ERROR HANDLING
// ========================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`,
    availableRoutes: [
      'GET /api/health',
      'GET /api/test/auth',
      'GET /api/test/citizen',
      'GET /api/test/admin',
      'GET /api/test-cors',
      'GET /api/debug-uploads',
      'GET /api/debug-file/:filename',
      'GET /api/test-static',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/verify',
      'GET /api/citizen/stats',
      'GET /api/citizen/requests',
      'POST /api/citizen/requests',
      'GET /api/admin/stats',
      'GET /api/admin/requests',
      'PUT /api/admin/requests/:id/status',
      'GET /uploads/* - Static file serving'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('💥 Server Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : error.message
  });
});

// ========================
// SERVER STARTUP
// ========================

// Start server
app.listen(PORT, HOST, () => {
  console.log('='.repeat(60));
  console.log('🚀 CITIZEN APP BACKEND SERVER STARTED SUCCESSFULLY');
  console.log('='.repeat(60));
  console.log(`📍 Server URL:    http://${HOST}:${PORT}`);
  console.log(`📍 Local:         http://localhost:${PORT}`);
  console.log(`🌐 Environment:   ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('📁 STATIC FILE SERVING:');
  console.log(`   Uploads Path:  ${uploadsDir}`);
  console.log(`   Access URL:    http://localhost:${PORT}/uploads/{filename}`);
  console.log(`   Current files: ${fs.readdirSync(uploadsDir).length} files`);
  console.log('');
  console.log('🛣️  AVAILABLE ENDPOINTS:');
  console.log('   GET  /api/health          - Health check');
  console.log('   GET  /api/debug-uploads   - Check uploads directory');
  console.log('   GET  /api/debug-file/:file - Check specific file');
  console.log('   GET  /api/test-static     - Test static files');
  console.log('   POST /api/auth/register   - User registration');
  console.log('   POST /api/auth/login      - User login');
  console.log('   GET  /api/auth/verify     - Token verification');
  console.log('   GET  /api/citizen/stats   - User statistics');
  console.log('   GET  /api/citizen/requests - Service requests');
  console.log('   POST /api/citizen/requests - Create service request');
  console.log('   GET  /api/admin/stats     - Admin statistics');
  console.log('   GET  /api/admin/requests  - Admin requests');
  console.log('   PUT  /api/admin/requests/:id/status - Update status');
  console.log('='.repeat(60));
});

export default app;