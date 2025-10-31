import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Admin middleware
const requireAdmin = (req, res, next) => {
  console.log('🔐 Checking admin access for user:', req.user);
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// GET all service requests
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        sr.*,
        u.name as user_name,
        u.email as user_email
      FROM service_requests sr
      LEFT JOIN users u ON sr.user_id = u.id
    `;
    
    let countQuery = `SELECT COUNT(*) FROM service_requests sr`;
    
    const queryParams = [];

    if (status !== 'all') {
      query += ` WHERE sr.status = $1`;
      countQuery += ` WHERE sr.status = $1`;
      queryParams.push(status);
    }

    query += ` ORDER BY sr.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(parseInt(limit), offset);

    console.log('📊 Admin requests query:', { 
      status, 
      page, 
      limit, 
      queryParams,
      isAll: status === 'all'
    });

    const requestsResult = await pool.query(query, queryParams);
    
    const countParams = status !== 'all' ? [status] : [];
    const countResult = await pool.query(countQuery, countParams);

    const requests = requestsResult.rows;
    const total = parseInt(countResult.rows[0].count);

    console.log(`✅ Fetched ${requests.length} requests (Status: ${status}, Total in DB: ${total})`);

    res.json({
      requests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRequests: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      filter: {
        status: status,
        showing: status === 'all' ? 'all requests' : `${status} requests`
      }
    });

  } catch (error) {
    console.error('❌ Error fetching admin requests:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});
// GET admin stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('📊 Admin fetching stats');

    const statusResult = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM service_requests 
      GROUP BY status
    `);

    const stats = {
      total: 0,
      byStatus: {}
    };

    statusResult.rows.forEach(row => {
      stats.byStatus[row.status] = parseInt(row.count);
      stats.total += parseInt(row.count);
    });

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load statistics'
    });
  }
});


// GET single request details
router.get('/requests/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`📄 Admin fetching request details: ${id}`);

    const result = await pool.query(`
      SELECT 
        sr.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone
      FROM service_requests sr
      LEFT JOIN users u ON sr.user_id = u.id
      WHERE sr.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    res.json({
      success: true,
      request: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error fetching request details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load request details',
      error: error.message
    });
  }
});
// UPDATE request status
router.put('/requests/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`🔄 Admin updating request ${id} to status: ${status}`);

    if (!['pending', 'in_progress', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const result = await pool.query(
      `UPDATE service_requests 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    console.log('✅ Status updated successfully');

    res.json({
      success: true,
      message: `Request status updated to ${status}`,
      request: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error updating request status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update request status'
    });
  }
});

export default router;