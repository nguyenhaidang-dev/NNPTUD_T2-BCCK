const mongoose = require('mongoose');
const Product = require('./schemas/Product');
const Inventory = require('./schemas/Inventory');
require('dotenv').config();

const fixInventory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drugstore_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Connected. Scanning products for inventory issues...');
    const products = await Product.find();
    let fixedCount = 0;
    
    for (const product of products) {
      const inv = await Inventory.findOne({ product: product._id });
      if (!inv) {
        await Inventory.create({
          product: product._id,
          quantityInStock: 500,
          batchNumber: 'FIXED-BATCH-01',
          reorderLevel: 20,
          reorderQuantity: 50,
          expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2))
        });
        fixedCount++;
        console.log(`[+] Created missing inventory for product: ${product.name}`);
      } else if (inv.quantityInStock === 0) {
        inv.quantityInStock = 500;
        await inv.save();
        fixedCount++;
        console.log(`[*] Restocked quantity for product: ${product.name}`);
      }
    }
    
    console.log(`Success! Finished fixing inventory for ${fixedCount} products.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixInventory();
