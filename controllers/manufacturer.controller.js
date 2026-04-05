const Manufacturer = require('../schemas/Manufacturer');

exports.getAllManufacturers = async (req, res) => {
  try {
    const manufacturers = await Manufacturer.find();
    res.status(200).json({ success: true, data: manufacturers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
