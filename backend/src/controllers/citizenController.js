import { query } from '../config/database.js';

export const getStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await query(`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_requests,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_requests
      FROM service_requests 
      WHERE user_id = $1
    `, [userId]);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRecentRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await query(`
      SELECT * FROM service_requests 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [userId]);

    res.json(requests.rows);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { service_type, description, location, priority } = req.body;

    const result = await query(
      `INSERT INTO service_requests (user_id, service_type, description, location, priority) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [userId, service_type, description, location, priority]
    );

    res.status(201).json({
      message: 'Service request created successfully',
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, address } = req.body;

    const result = await query(
      `UPDATE users SET name = $1, phone = $2, address = $3 
       WHERE id = $4 
       RETURNING id, name, email, phone, address, created_at`,
      [name, phone, address, userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};