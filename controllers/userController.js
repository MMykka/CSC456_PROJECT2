// User management (admin only): list users, change role, delete user.
const User = require('../models/User');

// GET /users
exports.index = async (req, res) => {
  const users = await User.find().sort('name');
  res.render('users/index', { title: 'Users', users });
};

// GET /users/:id/edit  - form to change a user's role
exports.editForm = async (req, res) => {
  const editUser = await User.findById(req.params.id);
  if (!editUser) return res.status(404).render('error', { title: 'Not Found', message: 'User not found.' });
  res.render('users/edit', { title: 'Change Role', editUser });
};

// PUT /users/:id  - save new role
exports.update = async (req, res) => {
  if (req.params.id === res.locals.user._id.toString()) {
    return res.status(400).render('error', { title: 'Not Allowed', message: 'You cannot change your own role.' });
  }
  await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { runValidators: true });
  res.redirect('/users');
};

// DELETE /users/:id
exports.destroy = async (req, res) => {
  if (req.params.id === res.locals.user._id.toString()) {
    return res.status(400).render('error', { title: 'Not Allowed', message: 'You cannot delete your own account.' });
  }
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/users');
};
