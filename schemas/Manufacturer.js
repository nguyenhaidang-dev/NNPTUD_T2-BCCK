const mongoose = require('mongoose');

const manufacturerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide manufacturer name'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      match: [/^[0-9]{10,}$/, 'Please provide a valid phone number'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    website: {
      type: String,
      match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'Please provide a valid website URL'],
    },
    registrationNumber: {
      type: String,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Manufacturer', manufacturerSchema);
