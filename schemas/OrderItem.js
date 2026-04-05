const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Please provide unit price'],
      min: [0, 'Unit price cannot be negative'],
    },
    lineTotal: {
      type: Number,
      required: [true, 'Please provide line total'],
      min: [0, 'Line total cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('OrderItem', orderItemSchema);
