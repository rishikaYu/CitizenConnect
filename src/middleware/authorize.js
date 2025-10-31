export const authorizeAdmin = (req, res, next) => {
  try {
    // Check if user exists and has admin role
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Admin privileges required to access this resource',
        yourRole: req.user.role,
        requiredRole: 'admin'
      });
    }

    // User is admin, proceed to next middleware
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ 
      error: 'Authorization failed',
      message: 'Unable to verify user privileges'
    });
  }
};