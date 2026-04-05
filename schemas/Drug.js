const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a drug name'],
      trim: true,
      maxlength: [100, 'Drug name cannot be more than 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a drug category'],
      enum: ['Antibiotic', 'Painkiller', 'Vitamin', 'Cough Syrup', 'Other'],
    },
    manufacturer: {
      type: String,
      required: [true, 'Please provide manufacturer name'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide quantity in stock'],
      min: [0, 'Quantity cannot be negative'],
    },
    expireDate: {
      type: Date,
      required: [true, 'Please provide expiration date'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    sku: {
      type: String,
      unique: true,
      required: [true, 'Please provide a SKU'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Drug', drugSchema);
