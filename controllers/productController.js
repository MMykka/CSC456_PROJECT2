// CRUD for products + managing the product <-> supplier relationship.
const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const getErrors = require('../utils/getErrors');

const pickFields = (body) => ({
  name: body.name,
  sku: body.sku,
  price: body.price,
  quantity: body.quantity,
  category: body.category || undefined
});

const notFound = (res) =>
  res.status(404).render('error', { title: 'Not Found', message: 'Product not found.' });

// READ - list: GET /products
exports.index = async (req, res) => {
  const products = await Product.find().populate('category').sort('name');
  res.render('products/index', { title: 'Products', products });
};

// READ - details: GET /products/:id
exports.show = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category').populate('suppliers');
  if (!product) return notFound(res);
  res.render('products/show', { title: product.name, product });
};

// CREATE - form: GET /products/new
exports.newForm = async (req, res) => {
  const categories = await Category.find().sort('name');
  res.render('products/new', { title: 'New Product', product: {}, categories, errors: [] });
};

// CREATE - save: POST /products
exports.create = async (req, res) => {
  try {
    const product = await Product.create(pickFields(req.body));
    res.redirect(`/products/${product._id}`);
  } catch (err) {
    const errors = getErrors(err);
    if (!errors) throw err;
    const categories = await Category.find().sort('name');
    res.status(400).render('products/new', { title: 'New Product', product: req.body, categories, errors });
  }
};

// UPDATE - form: GET /products/:id/edit
exports.editForm = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return notFound(res);
  const categories = await Category.find().sort('name');
  res.render('products/edit', { title: 'Edit Product', product, categories, errors: [] });
};

// UPDATE - save: PUT /products/:id
exports.update = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, pickFields(req.body), {
      runValidators: true
    });
    if (!product) return notFound(res);
    res.redirect(`/products/${req.params.id}`);
  } catch (err) {
    const errors = getErrors(err);
    if (!errors) throw err;
    const categories = await Category.find().sort('name');
    res.status(400).render('products/edit', {
      title: 'Edit Product',
      product: { _id: req.params.id, ...req.body },
      categories,
      errors
    });
  }
};

// DELETE - confirm page: GET /products/:id/delete
exports.deleteForm = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return notFound(res);
  res.render('products/delete', { title: 'Delete Product', product });
};

// DELETE - remove: DELETE /products/:id
exports.destroy = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect('/products');
};

// RELATIONSHIP - form: GET /products/:id/suppliers
// Shows all suppliers as checkboxes; the ones already linked are checked.
exports.suppliersForm = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return notFound(res);
  const suppliers = await Supplier.find().sort('name');
  const linkedIds = product.suppliers.map((id) => id.toString());
  res.render('products/suppliers', { title: 'Manage Suppliers', product, suppliers, linkedIds });
};

// RELATIONSHIP - save: PUT /products/:id/suppliers
exports.updateSuppliers = async (req, res) => {
  // A single checkbox arrives as a string, several arrive as an array, none = undefined.
  let ids = req.body.suppliers || [];
  if (!Array.isArray(ids)) ids = [ids];

  // Keep only ids of suppliers that really exist.
  const validSuppliers = await Supplier.find({ _id: { $in: ids } }).select('_id');

  const product = await Product.findByIdAndUpdate(req.params.id, {
    suppliers: validSuppliers.map((s) => s._id)
  });
  if (!product) return notFound(res);
  res.redirect(`/products/${req.params.id}`);
};
