const express = require('express');
const product = require('../controllers/productController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Every product route requires login.
router.use(requireAuth);

// Admin + employee: view, create, update
router.get('/', product.index);
router.get('/new', product.newForm);
router.post('/', product.create);
router.get('/:id', product.show);
router.get('/:id/edit', product.editForm);
router.put('/:id', product.update);

// Admin + employee: manage the product <-> supplier relationship (many-to-many)
router.get('/:id/suppliers', product.suppliersForm);
router.put('/:id/suppliers', product.updateSuppliers);

// Admin only: delete
router.get('/:id/delete', requireRole('admin'), product.deleteForm);
router.delete('/:id', requireRole('admin'), product.destroy);

module.exports = router;
