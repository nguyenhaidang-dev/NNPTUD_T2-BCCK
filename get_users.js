const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/drugstore_db').then(async () => {
    try {
        const User = require('./schemas/User');
        const Role = require('./schemas/Role');
        const users = await User.find().populate('role').select('email firstName lastName');
        
        console.log('\n--- DANH SACH TAI KHOAN ---');
        users.forEach(u => {
            const roleName = u.role ? u.role.name : 'Customer';
            console.log(`[${roleName}] Email: ${u.email} | Ten: ${u.firstName} ${u.lastName}`);
        });
        console.log('---------------------------\n');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
});
