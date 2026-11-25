const express = require('express');
const supplier = require('../controllers/supplierController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Every supplier route requires login.
router.use(requireAuth);

// Admin + employee: view, create, update
router.get('/', supplier.index);
router.get('/new', supplier.newForm);
router.post('/', supplier.create);
router.get('/:id', supplier.show);
router.get('/:id/edit', supplier.editForm);
router.put('/:id', supplier.update);

// Admin only: delete
router.get('/:id/delete', requireRole('admin'), supplier.deleteForm);
router.delete('/:id', requireRole('admin'), supplier.destroy);

module.exports = router;
