// CRUD for categories.
const Category = require('../models/Category');
const Product = require('../models/Product');
const getErrors = require('../utils/getErrors');

// Only take the fields we expect from the form (prevents extra fields being saved).
const pickFields = (body) => ({ name: body.name, description: body.description });

const notFound = (res) =>
  res.status(404).render('error', { title: 'Not Found', message: 'Category not found.' });

// READ - list: GET /categories
exports.index = async (req, res) => {
  const categories = await Category.find().sort('name');
  res.render('categories/index', { title: 'Categories', categories });
};

// READ - details: GET /categories/:id  (also shows its products = one-to-many)
exports.show = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return notFound(res);
  const products = await Product.find({ category: category._id }).sort('name');
  res.render('categories/show', { title: category.name, category, products });
};

// CREATE - form: GET /categories/new
exports.newForm = (req, res) => {
  res.render('categories/new', { title: 'New Category', category: {}, errors: [] });
};

// CREATE - save: POST /categories
exports.create = async (req, res) => {
  try {
    await Category.create(pickFields(req.body));
    res.redirect('/categories');
  } catch (err) {
    const errors = getErrors(err);
    if (!errors) throw err;
    res.status(400).render('categories/new', { title: 'New Category', category: req.body, errors });
  }
};

// UPDATE - form: GET /categories/:id/edit
exports.editForm = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return notFound(res);
  res.render('categories/edit', { title: 'Edit Category', category, errors: [] });
};

// UPDATE - save: PUT /categories/:id
exports.update = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, pickFields(req.body), {
      runValidators: true // apply schema validation on update too
    });
    if (!category) return notFound(res);
    res.redirect(`/categories/${req.params.id}`);
  } catch (err) {
    const errors = getErrors(err);
    if (!errors) throw err;
    res.status(400).render('categories/edit', {
      title: 'Edit Category',
      category: { _id: req.params.id, ...req.body },
      errors
    });
  }
};

// DELETE - confirm page: GET /categories/:id/delete
exports.deleteForm = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return notFound(res);
  const productCount = await Product.countDocuments({ category: category._id });
  res.render('categories/delete', { title: 'Delete Category', category, productCount });
};

// DELETE - remove: DELETE /categories/:id
exports.destroy = async (req, res) => {
  // A category that still has products cannot be deleted (keeps data consistent).
  const productCount = await Product.countDocuments({ category: req.params.id });
  if (productCount > 0) {
    return res.status(400).render('error', {
      title: 'Cannot Delete',
      message: 'This category still has products. Move or delete them first.'
    });
  }
  await Category.findByIdAndDelete(req.params.id);
  res.redirect('/categories');
};
