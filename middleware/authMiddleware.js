const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'super_strong_64char';

function verifyUser(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const parts = authHeader.split(' ').filter(Boolean);
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ success: false, error: 'Malformed authorization header' });
    }

    const token = parts[1];

    try {
      const decoded = jwt.verify(token, jwtSecret);

      req.user = {
        id: decoded.id,
        email: decoded.email
      };

      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Token expired' });
      }
      console.warn('JWT verification failed:', err);
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
  } catch (outerErr) {
    console.error('verifyUser middleware unexpected error:', outerErr);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}

module.exports = { verifyUser, validateRegister, validateLogin, validatePreferencesUpdate };
