const express = require('express');
const category = require('../controllers/categoryController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Every category route requires login.
router.use(requireAuth);

// Admin + employee: view, create, update
router.get('/', category.index);
router.get('/new', category.newForm);
router.post('/', category.create);
router.get('/:id', category.show);
router.get('/:id/edit', category.editForm);
router.put('/:id', category.update);

// Admin only: delete
router.get('/:id/delete', requireRole('admin'), category.deleteForm);
router.delete('/:id', requireRole('admin'), category.destroy);

module.exports = router;
