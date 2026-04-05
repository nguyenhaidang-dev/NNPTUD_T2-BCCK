const Product = require('../schemas/Product');
const Category = require('../schemas/Category');
const Manufacturer = require('../schemas/Manufacturer');
const Inventory = require('../schemas/Inventory'); // Added to auto-seed inventory
const User = require('../schemas/User');
const { getFileUrl, deleteFile } = require('../utils/upload');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const { name, sku, description, category, manufacturer, price, dosage, form, requiresPrescription, sideEffects, warnings } = req.body;

    // Validation
    if (!name || !sku || !category || !manufacturer || !price || !form) {
      // Delete uploaded file if validation fails
      if (req.file) {
        deleteFile(req.file.filename);
      }
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, sku, category, manufacturer, price, form',
      });
    }

    if (price < 0) {
      if (req.file) {
        deleteFile(req.file.filename);
      }
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative',
      });
    }

    // Check if SKU already exists
    const existingSKU = await Product.findOne({ sku });
    if (existingSKU) {
      if (req.file) {
        deleteFile(req.file.filename);
      }
      return res.status(400).json({
        success: false,
        message: 'SKU already exists',
      });
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      if (req.file) {
        deleteFile(req.file.filename);
      }
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Verify manufacturer exists
    const manufacturerExists = await Manufacturer.findById(manufacturer);
    if (!manufacturerExists) {
      if (req.file) {
        deleteFile(req.file.filename);
      }
      return res.status(404).json({
        success: false,
        message: 'Manufacturer not found',
      });
    }

    // Get image URL from uploaded file or use provided image URL
    const imageUrl = req.file ? getFileUrl(req.file.filename) : null;

    // Create product
    const product = await Product.create({
      name,
      sku,
      description,
      category,
      manufacturer,
      price,
      dosage,
      form,
      requiresPrescription: requiresPrescription || false,
      sideEffects: sideEffects || [],
      warnings: warnings || [],
      image: imageUrl,
    });

    // Tự động thêm 500 hàng tồn kho cho sản phẩm mới để tránh lỗi "Insufficient stock" khi test Đặt Hàng
    await Inventory.create({
      product: product._id,
      quantityInStock: 500,
      batchNumber: 'TEST-BATCH-01',
      reorderLevel: 20,
      reorderQuantity: 50,
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2))
    });

    // Populate references
    const populatedProduct = await product.populate(['category', 'manufacturer']);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, manufacturer, minPrice, maxPrice, search } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (manufacturer) {
      filter.manufacturer = manufacturer;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Product.countDocuments(filter);

    // Get products
    const products = await Product.find(filter)
      .populate('category')
      .populate('manufacturer')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('manufacturer');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user.id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({
          success: false,
          message: 'Product already reviewed',
        });
      }

      const review = {
        name: user ? `${user.firstName} ${user.lastName}` : 'Anonymous',
        rating: Number(rating),
        comment,
        user: req.user.id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

      await product.save();

      res.status(201).json({ success: true, message: 'Review added' });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const { name, sku, description, category, manufacturer, price, dosage, form, requiresPrescription, sideEffects, warnings, isActive } = req.body;

    // Find product
    let product = await Product.findById(req.params.id);

    if (!product) {
      if (req.file) {
        deleteFile(req.file.filename);
      }
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if SKU is being changed and if new SKU already exists
    if (sku && sku !== product.sku) {
      const existingSKU = await Product.findOne({ sku });
      if (existingSKU) {
        if (req.file) {
          deleteFile(req.file.filename);
        }
        return res.status(400).json({
          success: false,
          message: 'SKU already exists',
        });
      }
    }

    // Verify category exists if being updated
    if (category && category !== product.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        if (req.file) {
          deleteFile(req.file.filename);
        }
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }
    }

    // Verify manufacturer exists if being updated
    if (manufacturer && manufacturer !== product.manufacturer.toString()) {
      const manufacturerExists = await Manufacturer.findById(manufacturer);
      if (!manufacturerExists) {
        if (req.file) {
          deleteFile(req.file.filename);
        }
        return res.status(404).json({
          success: false,
          message: 'Manufacturer not found',
        });
      }
    }

    // Validate price if being updated
    if (price !== undefined && price < 0) {
      if (req.file) {
        deleteFile(req.file.filename);
      }
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative',
      });
    }

    // Update product
    const updateData = {};
    if (name) updateData.name = name;
    if (sku) updateData.sku = sku;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (manufacturer) updateData.manufacturer = manufacturer;
    if (price !== undefined) updateData.price = price;
    if (dosage) updateData.dosage = dosage;
    if (form) updateData.form = form;
    if (requiresPrescription !== undefined) updateData.requiresPrescription = requiresPrescription;
    if (sideEffects) updateData.sideEffects = sideEffects;
    if (warnings) updateData.warnings = warnings;
    
    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (product.image) {
        const oldFilename = product.image.split('/').pop();
        deleteFile(oldFilename);
      }
      updateData.image = getFileUrl(req.file.filename);
    }
    
    if (isActive !== undefined) updateData.isActive = isActive;

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('category')
      .populate('manufacturer');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Delete product image if exists
    if (product.image) {
      const filename = product.image.split('/').pop();
      deleteFile(filename);
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.categoryId,
      isActive: true,
    })
      .populate('category')
      .populate('manufacturer')
      .sort({ createdAt: -1 });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No products found in this category',
      });
    }

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get prescription-required products
// @route   GET /api/products/prescription/required
// @access  Public
exports.getPrescriptionRequiredProducts = async (req, res) => {
  try {
    const products = await Product.find({
      requiresPrescription: true,
      isActive: true,
    })
      .populate('category')
      .populate('manufacturer')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Search products
// @route   GET /api/products/search/:query
// @access  Public
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.params;

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { sku: { $regex: query, $options: 'i' } },
        { dosage: { $regex: query, $options: 'i' } },
      ],
      isActive: true,
    })
      .populate('category')
      .populate('manufacturer')
      .limit(20);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
