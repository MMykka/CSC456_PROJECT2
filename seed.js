// Fills the database with sample data and creates the first admin account.
// Run with: npm run seed
// WARNING: this deletes all existing data first.
require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const Category = require('./models/Category');
const Supplier = require('./models/Supplier');
const Product = require('./models/Product');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected. Clearing old data...');

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Supplier.deleteMany({}),
    Product.deleteMany({})
  ]);

  // Users (User.create runs the bcrypt hashing hook)
  await User.create({
    name: 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@inventory.com',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
    role: 'admin'
  });
  await User.create({
    name: 'Employee',
    email: 'employee@inventory.com',
    password: 'Employee123!',
    role: 'employee'
  });

  // Categories
  const [electronics, office, furniture] = await Category.create([
    { name: 'Electronics', description: 'Computers, phones and accessories' },
    { name: 'Office Supplies', description: 'Paper, pens and everyday items' },
    { name: 'Furniture', description: 'Desks, chairs and storage' }
  ]);

  // Suppliers
  const [techCorp, paperPlus, globalSupply] = await Supplier.create([
    { name: 'TechCorp', email: 'sales@techcorp.com', phone: '+1 555 0100', address: '1 Silicon Ave' },
    { name: 'PaperPlus', email: 'orders@paperplus.com', phone: '+1 555 0200', address: '22 Mill Road' },
    { name: 'Global Supply Co', email: 'info@globalsupply.com', phone: '+1 555 0300', address: '9 Harbor St' }
  ]);

  // Products (category = one-to-many, suppliers = many-to-many)
  await Product.create([
    { name: 'Laptop 14"', sku: 'EL-LAP-14', price: 899.99, quantity: 12, category: electronics._id, suppliers: [techCorp._id, globalSupply._id] },
    { name: 'Wireless Mouse', sku: 'EL-MOU-01', price: 24.5, quantity: 3, category: electronics._id, suppliers: [techCorp._id] },
    { name: 'A4 Paper (500 sheets)', sku: 'OF-PAP-A4', price: 6.99, quantity: 150, category: office._id, suppliers: [paperPlus._id, globalSupply._id] },
    { name: 'Blue Pens (box of 50)', sku: 'OF-PEN-BL', price: 12, quantity: 2, category: office._id, suppliers: [paperPlus._id] },
    { name: 'Office Chair', sku: 'FU-CHR-01', price: 149, quantity: 8, category: furniture._id, suppliers: [globalSupply._id] }
  ]);

  console.log('Seed complete!');
  console.log('Admin login:    ', process.env.ADMIN_EMAIL || 'admin@inventory.com', '/', process.env.ADMIN_PASSWORD || 'Admin123!');
  console.log('Employee login:  employee@inventory.com / Employee123!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
