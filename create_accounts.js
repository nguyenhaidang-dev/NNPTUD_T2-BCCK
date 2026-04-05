const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./schemas/User');
const Role = require('./schemas/Role');

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drugstore_db');

        const roles = await Role.find();
        
        const getRole = (name) => roles.find(r => r.name === name);

        const adminRole = getRole('Admin');
        const managerRole = getRole('Manager');
        const pharmacistRole = getRole('Pharmacist');

        const hashedPassword = await bcrypt.hash('123456', 10);

        const usersToCreate = [
            {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin2@gmail.com',
                phone: '0900000001',
                password: hashedPassword,
                role: adminRole._id
            },
            {
                firstName: 'Manager',
                lastName: 'User',
                email: 'manager@gmail.com',
                phone: '0900000002',
                password: hashedPassword,
                role: managerRole._id
            },
            {
                firstName: 'Pharmacist',
                lastName: 'User',
                email: 'pharmacist@gmail.com',
                phone: '0900000003',
                password: hashedPassword,
                role: pharmacistRole._id
            }
        ];

        for (let u of usersToCreate) {
            let exists = await User.findOne({ email: u.email });
            if (!exists) {
                await User.create(u);
                console.log(`Created user: ${u.email}`);
            } else {
                console.log(`User already exists: ${u.email}`);
            }
        }

        console.log('\n--- DANH SACH TAI KHOAN MOI ---');
        console.log('Password chung: 123456\n');
        console.log(`[Admin] Email: admin2@gmail.com`);
        console.log(`[Manager] Email: manager@gmail.com`);
        console.log(`[Pharmacist] Email: pharmacist@gmail.com`);
        console.log('-------------------------------\n');

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedUsers();
