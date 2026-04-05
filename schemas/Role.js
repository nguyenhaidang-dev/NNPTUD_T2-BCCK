const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a role name'],
      unique: true,
      trim: true,
      enum: ['Admin', 'Manager', 'Pharmacist', 'Customer'],
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [
      {
        type: String,
        enum: [
          'create_user',
          'edit_user',
          'delete_user',
          'view_reports',
          'manage_inventory',
          'manage_products',
          'process_orders',
          'view_prescriptions',
          'manage_prescriptions',
          'view_orders',
          'create_orders',
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Role', roleSchema);
