const Banner = require('../schemas/Banner');
const Promotion = require('../schemas/Promotion');

// ========================
// BANNER CONTROLLERS
// ========================

// @desc    Get all active banners
// @route   GET /api/marketing/banners
// @access  Public
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort('order');
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new banner
// @route   POST /api/marketing/banners
// @access  Private/Admin
exports.createBanner = async (req, res) => {
  try {
    const { title, imageUrl, linkUrl, isActive, order } = req.body;
    const banner = await Banner.create({ title, imageUrl, linkUrl, isActive, order });
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a banner
// @route   PUT /api/marketing/banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a banner
// @route   DELETE /api/marketing/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.status(200).json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// PROMOTION CONTROLLERS
// ========================

// @desc    Get all promotions
// @route   GET /api/marketing/promotions
// @access  Private/Admin
exports.getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: promotions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a promotion
// @route   POST /api/marketing/promotions
// @access  Private/Admin
exports.createPromotion = async (req, res) => {
  try {
    const banner = await Promotion.create(req.body);
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a promotion
// @route   PUT /api/marketing/promotions/:id
// @access  Private/Admin
exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!promotion) return res.status(404).json({ success: false, message: 'Promotion not found' });
    res.status(200).json({ success: true, data: promotion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a promotion
// @route   DELETE /api/marketing/promotions/:id
// @access  Private/Admin
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) return res.status(404).json({ success: false, message: 'Promotion not found' });
    res.status(200).json({ success: true, message: 'Promotion deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate promotion code
// @route   POST /api/marketing/promotions/validate
// @access  Private
exports.validatePromotion = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    
    if (!code) return res.status(400).json({ success: false, message: 'Please provide a code' });

    const promotion = await Promotion.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' });
    }

    if (new Date() < promotion.validFrom || new Date() > promotion.validUntil) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá không nằm trong thời gian áp dụng.' });
    }

    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết lượt sử dụng.' });
    }

    if (cartTotal < promotion.minOrderValue) {
      return res.status(400).json({ success: false, message: `Chỉ áp dụng cho đơn hàng từ ${promotion.minOrderValue.toLocaleString()}đ trở lên.` });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promotion.discountType === 'percentage') {
      discountAmount = (cartTotal * promotion.discountValue) / 100;
      if (promotion.maxDiscountAmount && discountAmount > promotion.maxDiscountAmount) {
        discountAmount = promotion.maxDiscountAmount;
      }
    } else {
      discountAmount = promotion.discountValue;
    }

    res.status(200).json({
      success: true,
      data: {
        code: promotion.code,
        discountAmount,
        promotionId: promotion._id
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
