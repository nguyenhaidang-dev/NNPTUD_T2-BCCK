const mongoose = require('mongoose');
const Role = require('./schemas/Role');
require('dotenv').config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drugstore_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const roles = [
            { name: 'Admin', permissions: ['create_user', 'edit_user', 'delete_user', 'view_reports', 'manage_inventory', 'manage_products', 'process_orders', 'view_prescriptions', 'manage_prescriptions', 'view_orders', 'create_orders'] },
            { name: 'Pharmacist', permissions: ['manage_inventory', 'view_prescriptions', 'manage_prescriptions'] },
            { name: 'Manager', permissions: ['view_reports', 'manage_inventory', 'manage_products', 'process_orders', 'view_prescriptions', 'manage_prescriptions', 'view_orders', 'create_orders'] }
        ];

        for (const role of roles) {
            const exists = await Role.findOne({ name: role.name });
            if (!exists) await Role.create(role);
        }
        console.log('Roles seeded successfully!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seed();
