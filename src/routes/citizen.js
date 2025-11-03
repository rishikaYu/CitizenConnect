import express from 'express';
import multer from 'multer';
import { pool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = express.Router();

router.post('/requests', authenticateToken, uploadMiddleware, async (req, res) => {
  try {
    console.log('📨 Received request creation:', {
      body: req.body,
      file: req.file ? {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size
      } : 'No file'
    });

    const { service_type, location, description, priority, exact_location } = req.body;
    const user_id = req.user.id;

    // Prepare image path
    let image_path = null;
    if (req.file) {
      image_path = `uploads/${req.file.filename}`;
      console.log('💾 Image path saved:', image_path);
    }

    // Insert into database
    const query = `
      INSERT INTO service_requests 
      (user_id, service_type, location, exact_location, description, priority, image_path, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') 
      RETURNING *
    `;

    const values = [user_id, service_type, location, exact_location, description, priority, image_path];

    const result = await pool.query(query, values);
    const newRequest = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Service request created successfully',
      request: newRequest
    });

  } catch (error) {
    console.error('Error creating service request:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});
// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// POST - Create service request with file upload support
router.post('/requests', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    console.log('📝 Creating service request for user:', req.user.id);
    console.log('📝 Request body:', req.body);
    console.log('📝 File:', req.file);

    const { service_type, description, location, exact_location, priority } = req.body;

    // Validation
    if (!service_type || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Service type, description, and location are required'
      });
    }

    // Handle file if present
   let image_path = null;
if (req.file) {
  image_path = `/uploads/${req.file.filename}`;
  console.log('📸 Image saved at:', image_path);
}


    // Insert into database
  const result = await pool.query(
  `INSERT INTO service_requests 
   (user_id, service_type, description, location, exact_location, priority, status, image_path) 
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
   RETURNING *`,
  [req.user.id, service_type, description, location, exact_location, priority, 'pending', image_path]
);



    console.log('✅ Service request created:', result.rows[0]);

    res.json({
      success: true,
      message: 'Service request submitted successfully',
      request: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error creating service request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit service request',
      error: error.message
    });
  }
});
// GET - User's service requests
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Getting requests for user:', req.user.id);

    const result = await pool.query(
      `SELECT * FROM service_requests WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );

    console.log('✅ Requests found:', result.rows.length);

    res.json({
      success: true,
      requests: result.rows
    });

  } catch (error) {
    console.error('❌ Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load requests',
      error: error.message
    });
  }
});

// GET - User stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Getting stats for user:', req.user.id);

    const result = await pool.query(
      `SELECT status, COUNT(*) as count FROM service_requests WHERE user_id = $1 GROUP BY status`,
      [req.user.id]
    );

    const stats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      in_progress: 0,
      completed: 0
    };

    result.rows.forEach(row => {
      const status = row.status.toLowerCase();
      const count = parseInt(row.count);
      stats[status] = count;
      stats.total += count;
    });

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load stats',
      error: error.message
    });
  }
});

export default router;