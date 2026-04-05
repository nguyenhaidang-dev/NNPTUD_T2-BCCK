const jwt = require('jsonwebtoken');
const User = require('../schemas/User');
const Role = require('../schemas/Role');

// @desc    Verify JWT token and protect routes
// @middleware
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - No token provided',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - Invalid token',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Grant access to specific roles
// @middleware
exports.authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      // Get user from database with role
      const user = await User.findById(req.user.id).populate('role');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if user role is in allowed roles
      if (!roles.includes(user.role.name)) {
        return res.status(403).json({
          success: false,
          message: `User role '${user.role.name}' is not authorized to access this route`,
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

// @desc    Admin authorization
// @middleware
exports.admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role.name !== 'Admin' && user.role.name !== 'Manager') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Pharmacist authorization
// @middleware
exports.pharmacist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const allowedRoles = ['Admin', 'Pharmacist'];
    if (!allowedRoles.includes(user.role.name)) {
      return res.status(403).json({
        success: false,
        message: 'Pharmacist access required',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
