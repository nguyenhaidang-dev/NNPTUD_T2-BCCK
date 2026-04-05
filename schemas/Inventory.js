const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true,
    },
    quantityInStock: {
      type: Number,
      required: [true, 'Please provide quantity in stock'],
      min: [0, 'Quantity cannot be negative'],
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Please provide reorder level'],
      min: [0, 'Reorder level cannot be negative'],
    },
    reorderQuantity: {
      type: Number,
      required: [true, 'Please provide reorder quantity'],
      min: [1, 'Reorder quantity must be at least 1'],
    },
    batchNumber: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    lastRestockDate: Date,
    lastRestockQuantity: Number,
    isLowStock: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Inventory', inventorySchema);
