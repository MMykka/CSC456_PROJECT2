// CRUD for suppliers.
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const getErrors = require('../utils/getErrors');

const pickFields = (body) => ({
  name: body.name,
  email: body.email,
  phone: body.phone,
  address: body.address
});

const notFound = (res) =>
  res.status(404).render('error', { title: 'Not Found', message: 'Supplier not found.' });

// READ - list: GET /suppliers
exports.index = async (req, res) => {
  const suppliers = await Supplier.find().sort('name');
  res.render('suppliers/index', { title: 'Suppliers', suppliers });
};

// READ - details: GET /suppliers/:id  (also shows the products it supplies = many-to-many)
exports.show = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return notFound(res);
  const products = await Product.find({ suppliers: supplier._id }).populate('category').sort('name');
  res.render('suppliers/show', { title: supplier.name, supplier, products });
};

// CREATE - form: GET /suppliers/new
exports.newForm = (req, res) => {
  res.render('suppliers/new', { title: 'New Supplier', supplier: {}, errors: [] });
};

// CREATE - save: POST /suppliers
exports.create = async (req, res) => {
  try {
    await Supplier.create(pickFields(req.body));
    res.redirect('/suppliers');
  } catch (err) {
    const errors = getErrors(err);
    if (!errors) throw err;
    res.status(400).render('suppliers/new', { title: 'New Supplier', supplier: req.body, errors });
  }
};

// UPDATE - form: GET /suppliers/:id/edit
exports.editForm = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return notFound(res);
  res.render('suppliers/edit', { title: 'Edit Supplier', supplier, errors: [] });
};

// UPDATE - save: PUT /suppliers/:id
exports.update = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, pickFields(req.body), {
      runValidators: true
    });
    if (!supplier) return notFound(res);
    res.redirect(`/suppliers/${req.params.id}`);
  } catch (err) {
    const errors = getErrors(err);
    if (!errors) throw err;
    res.status(400).render('suppliers/edit', {
      title: 'Edit Supplier',
      supplier: { _id: req.params.id, ...req.body },
      errors
    });
  }
};

// DELETE - confirm page: GET /suppliers/:id/delete
exports.deleteForm = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return notFound(res);
  res.render('suppliers/delete', { title: 'Delete Supplier', supplier });
};

// DELETE - remove: DELETE /suppliers/:id
exports.destroy = async (req, res) => {
  await Supplier.findByIdAndDelete(req.params.id);
  // Remove this supplier from every product that referenced it (clean up many-to-many link).
  await Product.updateMany({ suppliers: req.params.id }, { $pull: { suppliers: req.params.id } });
  res.redirect('/suppliers');
};
