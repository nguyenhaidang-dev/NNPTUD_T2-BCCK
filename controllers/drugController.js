const Drug = require('../schemas/Drug');

// Get all drugs
exports.getAllDrugs = async (req, res) => {
  try {
    const drugs = await Drug.find();
    res.status(200).json({
      success: true,
      count: drugs.length,
      data: drugs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single drug by ID
exports.getDrugById = async (req, res) => {
  try {
    const drug = await Drug.findById(req.params.id);
    if (!drug) {
      return res.status(404).json({
        success: false,
        message: 'Drug not found',
      });
    }
    res.status(200).json({
      success: true,
      data: drug,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create a new drug
exports.createDrug = async (req, res) => {
  try {
    const drug = await Drug.create(req.body);
    res.status(201).json({
      success: true,
      data: drug,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update drug
exports.updateDrug = async (req, res) => {
  try {
    const drug = await Drug.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!drug) {
      return res.status(404).json({
        success: false,
        message: 'Drug not found',
      });
    }
    res.status(200).json({
      success: true,
      data: drug,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete drug
exports.deleteDrug = async (req, res) => {
  try {
    const drug = await Drug.findByIdAndDelete(req.params.id);
    if (!drug) {
      return res.status(404).json({
        success: false,
        message: 'Drug not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Drug deleted successfully',
      data: drug,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
