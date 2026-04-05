const mongoose = require('mongoose');
const Category = require('./schemas/Category');
const Manufacturer = require('./schemas/Manufacturer');
const Inventory = require('./schemas/Inventory');
const Product = require('./schemas/Product');
require('dotenv').config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drugstore_db');

        // 1. Setup Category
        let category = await Category.findOne({ name: 'Thuốc Đau Đầu' });
        if (!category) {
            category = await Category.create({ name: 'Thuốc Đau Đầu', description: 'Các dòng giảm đau' });
        }

        // 2. Setup Manufacturer
        let manufacturer = await Manufacturer.findOne({ name: 'Dược Hậu Giang' });
        if (!manufacturer) {
            manufacturer = await Manufacturer.create({ name: 'Dược Hậu Giang', phone: '0123456789', email: 'dhg@gmail.com' });
        }

        console.log('--- DỮ LIỆU ĐỂ TEST POSTMAN ---');
        console.log(`category_id = "${category._id}"`);
        console.log(`manufacturer_id = "${manufacturer._id}"`);

        // Add dummy inventory for existing products
        const products = await Product.find();
        for (let p of products) {
            let inv = await Inventory.findOne({ product: p._id });
            if (!inv) {
                await Inventory.create({ product: p._id, quantityInStock: 500, batchNumber: 'BATCH01' });
            } else {
                inv.quantityInStock = 500;
                await inv.save();
            }
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seed();
