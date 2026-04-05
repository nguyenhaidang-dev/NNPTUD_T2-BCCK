const Order = require('../schemas/Order');
const OrderItem = require('../schemas/OrderItem');
const Product = require('../schemas/Product');
const Inventory = require('../schemas/Inventory');
const User = require('../schemas/User');

// Generate unique order number
const generateOrderNumber = async () => {
  const count = await Order.countDocuments();
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `ORD-${year}${month}-${String(count + 1).padStart(6, '0')}`;
};

// @desc    Create a new order with items
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one item',
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide shipping address',
      });
    }

    // Get current user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let subtotal = 0;
    const orderItems = [];
    const invalidItems = [];

    // Validate and process each item
    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity) {
        invalidItems.push({ productId, reason: 'Missing productId or quantity' });
        continue;
      }

      if (quantity <= 0) {
        invalidItems.push({ productId, reason: 'Quantity must be greater than 0' });
        continue;
      }

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        invalidItems.push({ productId, reason: 'Product not found' });
        continue;
      }

      // Check inventory
      const inventory = await Inventory.findOne({ product: productId });
      if (!inventory || inventory.quantityInStock < quantity) {
        invalidItems.push({
          productId,
          reason: `Insufficient stock. Available: ${inventory?.quantityInStock || 0}`,
        });
        continue;
      }

      const lineTotal = product.price * quantity;
      subtotal += lineTotal;

      orderItems.push({
        product: productId,
        quantity,
        unitPrice: product.price,
        lineTotal,
        discount: 0,
      });
    }

    if (invalidItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some items are invalid',
        invalidItems,
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid items in order',
      });
    }

    // Calculate totals
    const taxAmount = subtotal * 0.1; // 10% tax
    const shippingCost = 50; // Fixed shipping cost
    const totalAmount = subtotal + taxAmount + shippingCost;

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order
    const order = await Order.create({
      orderNumber,
      customer: req.user.id,
      status: 'Pending',
      subtotal,
      taxAmount,
      shippingCost,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'Credit Card',
      paymentStatus: 'Pending',
    });

    // Create order items
    const createdOrderItems = await OrderItem.insertMany(
      orderItems.map((item) => ({
        ...item,
        order: order._id,
      }))
    );

    // Update inventory for each product
    for (const item of orderItems) {
      await Inventory.findOneAndUpdate(
        { product: item.product },
        {
          $inc: { quantityInStock: -item.quantity },
          lastRestockDate: new Date(),
          lastRestockQuantity: -item.quantity,
        }
      );
    }

    // Populate and return
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'firstName lastName email phone');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: populatedOrder,
        items: createdOrderItems,
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

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate('customer', 'firstName lastName email phone')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { customer: req.user.id };
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone address');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user is owner or admin
    if (order.customer._id.toString() !== req.user.id) {
      const user = await User.findById(req.user.id).populate('role');
      if (user.role.name !== 'Admin' && user.role.name !== 'Manager') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this order',
        });
      }
    }

    // Get order items
    const orderItems = await OrderItem.find({ order: req.params.id })
      .populate('product', 'name sku price form dosage');

    res.status(200).json({
      success: true,
      data: {
        order,
        items: orderItems,
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

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status',
      });
    }

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Update status
    order.status = status;

    if (status === 'Shipped' && !order.shippedDate) {
      order.shippedDate = new Date();
    }

    if (status === 'Delivered' && !order.deliveredDate) {
      order.deliveredDate = new Date();
    }

    if (status === 'Cancelled') {
      // Restore inventory for cancelled order
      const orderItems = await OrderItem.find({ order: req.params.id });
      for (const item of orderItems) {
        await Inventory.findOneAndUpdate(
          { product: item.product },
          { $inc: { quantityInStock: item.quantity } }
        );
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'Please provide payment status',
      });
    }

    const validPaymentStatuses = ['Pending', 'Completed', 'Failed'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Payment status must be one of: ${validPaymentStatuses.join(', ')}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user is owner or admin
    if (order.customer.toString() !== req.user.id) {
      const user = await User.findById(req.user.id).populate('role');
      if (user.role.name !== 'Admin' && user.role.name !== 'Manager') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this order',
        });
      }
    }

    // Can only cancel pending or processing orders
    if (!['Pending', 'Processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    // Restore inventory
    const orderItems = await OrderItem.find({ order: req.params.id });
    for (const item of orderItems) {
      await Inventory.findOneAndUpdate(
        { product: item.product },
        { $inc: { quantityInStock: item.quantity } }
      );
    }

    // Update order status
    order.status = 'Cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/stats/summary
// @access  Private/Admin
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });

    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        cancelledOrders,
        pendingOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
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
