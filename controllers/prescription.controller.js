const Prescription = require('../schemas/Prescription');
const PrescriptionItem = require('../schemas/PrescriptionItem');
const Product = require('../schemas/Product');
const User = require('../schemas/User');
const { getFileUrl, deleteFile } = require('../utils/upload');

// Generate unique prescription number
const generatePrescriptionNumber = async () => {
  const count = await Prescription.countDocuments();
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `RX-${year}${month}-${String(count + 1).padStart(5, '0')}`;
};

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Private/Pharmacist
exports.createPrescription = async (req, res) => {
  try {
    let { customerId, doctorName, licenseNumber, specialization, prescriptionDate, expiryDate, notes, items } = req.body;

    // Handle form-data array parsing
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        items = [];
      }
    }

    // Validation
    if (!customerId || !doctorName || !prescriptionDate || !expiryDate) {
      if (req.file) {
        deleteFile(req.file.filename);
      }
      return res.status(400).json({
        success: false,
        message: 'Please provide customerId, doctorName, prescriptionDate, and expiryDate',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      if (req.file) {
        deleteFile(req.file.filename);
      }
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one prescription item',
      });
    }

    // Verify customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      if (req.file) {
        deleteFile(req.file.filename);
      }
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Validate dates
    const rxDate = new Date(prescriptionDate);
    const expDate = new Date(expiryDate);
    if (expDate <= rxDate) {
      if (req.file) {
        deleteFile(req.file.filename);
      }
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be after prescription date',
      });
    }

    // Validate prescription items
    const prescriptionItems = [];
    const invalidItems = [];

    for (const item of items) {
      const { productId, quantity, frequency, duration, instructions } = item;

      if (!productId || !quantity || !frequency) {
        invalidItems.push({ productId, reason: 'Missing productId, quantity, or frequency' });
        continue;
      }

      if (quantity <= 0) {
        invalidItems.push({ productId, reason: 'Quantity must be greater than 0' });
        continue;
      }

      // Check if product exists and requires prescription
      const product = await Product.findById(productId);
      if (!product) {
        invalidItems.push({ productId, reason: 'Product not found' });
        continue;
      }

      if (!product.requiresPrescription) {
        invalidItems.push({ productId, reason: 'Product does not require prescription' });
        continue;
      }

      prescriptionItems.push({
        product: productId,
        quantity,
        frequency,
        duration,
        instructions,
      });
    }

    if (invalidItems.length > 0) {
      if (req.file) {
        deleteFile(req.file.filename);
      }
      return res.status(400).json({
        success: false,
        message: 'Some items are invalid',
        invalidItems,
      });
    }

    if (prescriptionItems.length === 0) {
      if (req.file) {
        deleteFile(req.file.filename);
      }
      return res.status(400).json({
        success: false,
        message: 'No valid prescription items',
      });
    }

    // Generate prescription number
    const prescriptionNumber = await generatePrescriptionNumber();

    // Get image URL from uploaded file
    const imageUrl = req.file ? getFileUrl(req.file.filename) : null;

    // Create prescription
    const prescription = await Prescription.create({
      prescriptionNumber,
      customer: customerId,
      doctor: {
        name: doctorName,
        licenseNumber,
        specialization,
      },
      prescriptionDate: rxDate,
      expiryDate: expDate,
      status: 'Pending',
      notes,
      prescriptionImage: imageUrl,
    });

    // Create prescription items
    const createdItems = await PrescriptionItem.insertMany(
      prescriptionItems.map((item) => ({
        ...item,
        prescription: prescription._id,
      }))
    );

    // Populate and return
    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('customer', 'firstName lastName email phone')
      .populate('filledBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: {
        prescription: populatedPrescription,
        items: createdItems,
      },
    });
  } catch (error) {
    console.error(error);
    if (req.file) {
      deleteFile(req.file.filename);
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all prescriptions (Admin/Pharmacist)
// @route   GET /api/prescriptions/admin/all
// @access  Private/Admin/Pharmacist
exports.getAllPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customerId } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (customerId) {
      filter.customer = customerId;
    }

    const skip = (page - 1) * limit;
    const total = await Prescription.countDocuments(filter);

    const prescriptions = await Prescription.find(filter)
      .populate('customer', 'firstName lastName email phone')
      .populate('filledBy', 'firstName lastName')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: prescriptions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's prescriptions
// @route   GET /api/prescriptions/my-prescriptions
// @access  Private
exports.getMyPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { customer: req.user.id };
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const total = await Prescription.countDocuments(filter);

    const prescriptions = await Prescription.find(filter)
      .populate('filledBy', 'firstName lastName')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: prescriptions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone address')
      .populate('filledBy', 'firstName lastName');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    // Check authorization - user can only view own, admin can view all
    if (prescription.customer._id.toString() !== req.user.id) {
      const user = await User.findById(req.user.id).populate('role');
      if (user.role.name !== 'Admin' && user.role.name !== 'Pharmacist') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this prescription',
        });
      }
    }

    // Get prescription items
    const items = await PrescriptionItem.find({ prescription: req.params.id })
      .populate('product', 'name sku form dosage requiresPrescription');

    res.status(200).json({
      success: true,
      data: {
        prescription,
        items,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add items to prescription
// @route   POST /api/prescriptions/:id/items
// @access  Private/Pharmacist
exports.addPrescriptionItems = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one item',
      });
    }

    // Check if prescription exists
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    // Validate items
    const prescriptionItems = [];
    const invalidItems = [];

    for (const item of items) {
      const { productId, quantity, frequency, duration, instructions } = item;

      if (!productId || !quantity || !frequency) {
        invalidItems.push({ productId, reason: 'Missing required fields' });
        continue;
      }

      if (quantity <= 0) {
        invalidItems.push({ productId, reason: 'Quantity must be greater than 0' });
        continue;
      }

      // Check product exists
      const product = await Product.findById(productId);
      if (!product) {
        invalidItems.push({ productId, reason: 'Product not found' });
        continue;
      }

      if (!product.requiresPrescription) {
        invalidItems.push({ productId, reason: 'Product does not require prescription' });
        continue;
      }

      prescriptionItems.push({
        product: productId,
        quantity,
        frequency,
        duration,
        instructions,
      });
    }

    if (invalidItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some items are invalid',
        invalidItems,
      });
    }

    // Create items
    const createdItems = await PrescriptionItem.insertMany(
      prescriptionItems.map((item) => ({
        ...item,
        prescription: req.params.id,
      }))
    );

    res.status(201).json({
      success: true,
      message: 'Items added to prescription successfully',
      data: createdItems,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update prescription status
// @route   PUT /api/prescriptions/:id/status
// @access  Private/Pharmacist
exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status',
      });
    }

    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Filled', 'Expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    prescription.status = status;

    if (status === 'Filled') {
      prescription.filledDate = new Date();
      prescription.filledBy = req.user.id;
    }

    if (status === 'Rejected') {
      prescription.filledDate = new Date();
      prescription.filledBy = req.user.id;
    }

    await prescription.save();

    const updated = await Prescription.findById(prescription._id)
      .populate('customer', 'firstName lastName email')
      .populate('filledBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Prescription status updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update prescription item
// @route   PUT /api/prescriptions/items/:itemId
// @access  Private/Pharmacist
exports.updatePrescriptionItem = async (req, res) => {
  try {
    const { quantity, frequency, duration, instructions, quantityDispensed } = req.body;

    const item = await PrescriptionItem.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Prescription item not found',
      });
    }

    if (quantity !== undefined && quantity > 0) {
      item.quantity = quantity;
    }
    if (frequency) {
      item.frequency = frequency;
    }
    if (duration) {
      item.duration = duration;
    }
    if (instructions) {
      item.instructions = instructions;
    }
    if (quantityDispensed !== undefined && quantityDispensed >= 0) {
      item.quantityDispensed = quantityDispensed;
    }

    await item.save();

    const updated = await PrescriptionItem.findById(item._id).populate('product', 'name sku form');

    res.status(200).json({
      success: true,
      message: 'Prescription item updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private/Pharmacist
exports.deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    // Delete prescription image if exists
    if (prescription.prescriptionImage) {
      const filename = prescription.prescriptionImage.split('/').pop();
      deleteFile(filename);
    }

    // Delete all prescription items
    await PrescriptionItem.deleteMany({ prescription: req.params.id });

    // Delete prescription
    await Prescription.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully',
      data: prescription,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get pending prescriptions
// @route   GET /api/prescriptions/pending/list
// @access  Private/Pharmacist
exports.getPendingPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const total = await Prescription.countDocuments({ status: 'Pending' });

    const prescriptions = await Prescription.find({ status: 'Pending' })
      .populate('customer', 'firstName lastName email phone')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: prescriptions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Check prescription validity
// @route   GET /api/prescriptions/:id/validity
// @access  Private
exports.checkPrescriptionValidity = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    const now = new Date();
    const isExpired = now > prescription.expiryDate;
    const isValid = prescription.status === 'Approved' && !isExpired;

    res.status(200).json({
      success: true,
      data: {
        prescriptionNumber: prescription.prescriptionNumber,
        status: prescription.status,
        isExpired,
        isValid,
        expiryDate: prescription.expiryDate,
        daysRemaining: Math.ceil((prescription.expiryDate - now) / (1000 * 60 * 60 * 24)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
