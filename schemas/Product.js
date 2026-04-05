const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: [100, 'Product name cannot be more than 100 characters'],
    },
    sku: {
      type: String,
      required: [true, 'Please provide SKU'],
      unique: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    manufacturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manufacturer',
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      min: [0, 'Price cannot be negative'],
    },
    dosage: {
      type: String,
      trim: true,
    },
    form: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Liquid', 'Injection', 'Ointment', 'Cream', 'Powder', 'Other', 'Viên nén', 'Viên nang', 'Dung dịch', 'Thuốc tiêm', 'Thuốc mỡ', 'Kem', 'Bột', 'Khác'],
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    sideEffects: [String],
    warnings: [String],
    image: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
