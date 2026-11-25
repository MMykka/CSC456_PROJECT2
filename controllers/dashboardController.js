// Dashboard home page: shows totals and low-stock products.
const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');

exports.index = async (req, res) => {
  const [productCount, categoryCount, supplierCount, lowStock] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
    Supplier.countDocuments(),
    Product.find({ quantity: { $lt: 5 } }).populate('category').sort('quantity')
  ]);

  res.render('dashboard', {
    title: 'Dashboard',
    productCount,
    categoryCount,
    supplierCount,
    lowStock
  });
};
