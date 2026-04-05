const mongoose = require('mongoose');

const prescriptionItemSchema = new mongoose.Schema(
  {
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
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
    frequency: {
      type: String,
    },
    duration: {
      type: String,
      description: 'Duration of the prescription (e.g., "7 days", "1 month")',
    },
    instructions: String,
    quantityDispensed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PrescriptionItem', prescriptionItemSchema);
