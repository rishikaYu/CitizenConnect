const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// POST /api/service-requests - Submit service request to database
router.post('/', auth, upload.single('image'), async (req, res) => {
  console.log('📥 Received service request submission');
  
  try {
    const {
      service_type,
      description,
      location,
      exact_location,
      priority = 'medium'
    } = req.body;

    console.log('📋 Form data:', {
      service_type,
      description: description.substring(0, 100) + '...', // Log first 100 chars
      location,
      exact_location,
      priority
    });

    // Validate required fields
    if (!service_type || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Service type, description, and location are required fields'
      });
    }

    // Get user from auth middleware
    const userId = req.user.id;
    console.log('👤 User ID:', userId);

    // Prepare data for database
    const requestData = {
      user_id: userId,
      service_type,
      description,
      location,
      exact_location: exact_location || null,
      priority,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Add image path if file was uploaded
    if (req.file) {
      requestData.image_path = req.file.path;
      requestData.image_filename = req.file.filename;
      console.log('🖼️ Image saved:', req.file.filename);
    }

    console.log('💾 Saving to database with data:', {
      ...requestData,
      description: requestData.description.substring(0, 50) + '...'
    });

    // Save to database
    const query = `
      INSERT INTO service_requests 
      (user_id, service_type, description, location, exact_location, priority, status, image_path, image_filename, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      requestData.user_id,
      requestData.service_type,
      requestData.description,
      requestData.location,
      requestData.exact_location,
      requestData.priority,
      requestData.status,
      requestData.image_path,
      requestData.image_filename,
      requestData.created_at,
      requestData.updated_at
    ];

    // Execute database query
    const result = await req.db.query(query, values);
    const savedRequest = result.rows[0];

    console.log('✅ Service request saved to database successfully! ID:', savedRequest.id);

    res.status(201).json({
      success: true,
      message: 'Service request submitted successfully!',
      requestId: savedRequest.id,
      request: savedRequest
    });

  } catch (error) {
    console.error('❌ Database error saving service request:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving service request to database',
      error: error.message
    });
  }
});

// GET /api/service-requests - Get user's service requests
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT * FROM service_requests 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    
    const result = await req.db.query(query, [userId]);
    
    res.json({
      success: true,
      requests: result.rows
    });
  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service requests'
    });
  }
});

module.exports = router;