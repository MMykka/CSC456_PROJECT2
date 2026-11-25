// Authentication & authorization middleware.
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Runs on every request: if a valid JWT cookie exists, load the user.
// The user is stored in res.locals so every EJS view can use it.
async function checkUser(req, res, next) {
  res.locals.user = null;
  const token = req.cookies.token;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws if invalid/expired
    const user = await User.findById(decoded.id);
    if (user) res.locals.user = user;
  } catch (err) {
    res.clearCookie('token'); // bad or expired token
  }
  next();
}

// Protects a route: only logged-in users can continue.
function requireAuth(req, res, next) {
  if (!res.locals.user) return res.redirect('/login');
  next();
}

// Protects a route by role, e.g. requireRole('admin').
function requireRole(...roles) {
  return (req, res, next) => {
    if (!res.locals.user || !roles.includes(res.locals.user.role)) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to do this.'
      });
    }
    next();
  };
}

module.exports = { checkUser, requireAuth, requireRole };
