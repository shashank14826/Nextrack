const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

const auth = (req, res, next) => {
  try {
    // Get the token from the header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

module.exports = auth; 