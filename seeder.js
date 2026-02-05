const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const { connectDB } = require('./src/config/db');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

const importData = async () => {
    try {
        console.log('Starting data import...');

        // Get or Create Admin User
        let adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.log('No admin user found. Creating one...');
            adminUser = await User.create({
                name: 'Seeder Admin',
                email: 'admin@seeder.com',
                password: 'password123',
                role: 'admin'
            });
        }
        console.log(`Using user: ${adminUser.email}`);

        // Get or Create Category
        let category = await Category.findOne({ name: 'Seeder Category' });
        if (!category) {
            console.log('No category found. Creating one...');
            category = await Category.create({
                name: 'Seeder Category',
                user: adminUser._id
            });
        }
        console.log(`Using category: ${category.name}`);

        // Create Products
        const products = [];
        const companies = ['ikea', 'liddy', 'marcos'];

        for (let i = 1; i <= 50; i++) {
            products.push({
                name: `Seeder Product ${i}`,
                price: Math.floor(Math.random() * 1000) + 10,
                description: `This is a description for seeder product ${i}. It is a great product.`,
                category: category._id,
                company: companies[Math.floor(Math.random() * companies.length)],
                colors: ['#000000', '#FFFFFF'],
                inventory: Math.floor(Math.random() * 100),
                featured: Math.random() > 0.8,
                user: adminUser._id
            });
        }

        await Product.insertMany(products);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const deleteData = async () => {
    try {
        await Product.deleteMany({ name: { $regex: /Seeder Product/ } });

        console.log('Seeder Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    deleteData();
} else {
    importData();
}
