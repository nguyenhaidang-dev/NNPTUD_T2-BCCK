const Setting = require('../schemas/Setting');

// Get all settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.find();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update or Create settings in bulk
exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body; // Expect an array of {key, value} objects
    
    if (!Array.isArray(updates)) {
       return res.status(400).json({ success: false, message: 'Must provide an array of settings' });
    }

    const updatedSettings = [];
    for (let item of updates) {
      if (item.key && item.value !== undefined) {
         const setting = await Setting.findOneAndUpdate(
           { key: item.key },
           { value: item.value, description: item.description, group: item.group },
           { new: true, upsert: true }
         );
         updatedSettings.push(setting);
      }
    }
    
    res.status(200).json({ success: true, data: updatedSettings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
