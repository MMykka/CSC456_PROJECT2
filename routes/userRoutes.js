const express = require('express');
const users = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// User management is admin only.
router.use(requireAuth, requireRole('admin'));

router.get('/', users.index);
router.get('/:id/edit', users.editForm);
router.put('/:id', users.update);
router.delete('/:id', users.destroy);

module.exports = router;
