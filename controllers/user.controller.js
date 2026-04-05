const User = require('../schemas/User');
const bcrypt = require('bcrypt');
const SystemLog = require('../schemas/SystemLog');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('role').select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin forces password reset for a user
exports.forceResetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide user ID and new password' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Log the action
    await SystemLog.create({
       user: req.user.id,
       action: 'FORCE_RESET_PASSWORD',
       details: `Reset password for user: ${user.email}`,
       ipAddress: req.ip
    });

    res.status(200).json({ success: true, message: 'Password reset successfully for ' + user.email });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change user role
exports.changeUserRole = async (req, res) => {
  try {
     const { roleId } = req.body;
     const user = await User.findByIdAndUpdate(req.params.id, { role: roleId }, { new: true }).populate('role');
     if(!user) return res.status(404).json({ success: false, message: 'User not found' });
     
     await SystemLog.create({
       user: req.user.id,
       action: 'CHANGE_USER_ROLE',
       details: `Changed role for user: ${user.email} to ${user.role.name}`,
       ipAddress: req.ip
     });

     res.status(200).json({ success: true, data: user });
  } catch (error) {
     res.status(500).json({ success: false, message: error.message });
  }
};
