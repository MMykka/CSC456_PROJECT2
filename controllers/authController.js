// Handles registration, login and logout.
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const getErrors = require('../utils/getErrors');

// Create a JWT and store it in an httpOnly cookie (JavaScript in the browser cannot read it).
function sendTokenCookie(res, user) {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
  res.cookie('token', token, {
    httpOnly: true,                                  // protects against XSS stealing the token
    secure: process.env.NODE_ENV === 'production',  // HTTPS only on Render
    sameSite: 'lax',                                 // basic CSRF protection
    maxAge: 24 * 60 * 60 * 1000                      // 1 day
  });
}

// GET /register
exports.registerForm = (req, res) => {
  res.render('auth/register', { title: 'Register', errors: [], form: {} });
};

// POST /register
exports.register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const form = { name, email };

  if (password !== confirmPassword) {
    return res.status(400).render('auth/register', { title: 'Register', errors: ['Passwords do not match'], form });
  }

  try {
    // New users are always "employee". Only an admin can promote someone to admin.
    const user = await User.create({ name, email, password, role: 'employee' });
    sendTokenCookie(res, user);
    res.redirect('/dashboard');
  } catch (err) {
    const errors = getErrors(err);
    if (!errors) throw err;
    res.status(400).render('auth/register', { title: 'Register', errors, form });
  }
};

// GET /login
exports.loginForm = (req, res) => {
  res.render('auth/login', { title: 'Login', errors: [], form: {} });
};

// POST /login
exports.login = async (req, res) => {
  const { email = '', password = '' } = req.body;

  // password has "select: false" in the model, so we ask for it explicitly
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).render('auth/login', {
      title: 'Login',
      errors: ['Invalid email or password'],
      form: { email }
    });
  }

  sendTokenCookie(res, user);
  res.redirect('/dashboard');
};

// POST /logout
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};
