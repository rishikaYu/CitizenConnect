import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔐 Auth Middleware - Token:', token ? 'Present' : 'Missing');

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_fallback_secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid or expired token' 
      });
    }
    
    console.log('✅ Token decoded:', decoded);
    
    // Set user with role
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'citizen'
    };
    
    console.log('✅ User set in request:', req.user);
    next();
  });
};