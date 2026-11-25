// Express application setup (middleware, view engine, routes).
// Kept separate from server.js so it can be tested without a database.
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

const { checkUser } = require('./middleware/auth');

const app = express();

// View engine: EJS templates live in /views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public'))); // CSS files
app.use(express.urlencoded({ extended: true }));          // read HTML form data
app.use(cookieParser());                                  // read the JWT cookie
app.use(methodOverride('_method'));                       // allow PUT/DELETE from HTML forms
app.use(checkUser);                                       // make logged-in user available to views

// Routes
app.get('/', (req, res) => res.redirect(res.locals.user ? '/dashboard' : '/login'));
app.use('/', require('./routes/authRoutes'));
app.use('/dashboard', require('./routes/dashboardRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use('/categories', require('./routes/categoryRoutes'));
app.use('/suppliers', require('./routes/supplierRoutes'));
app.use('/users', require('./routes/userRoutes'));

// 404 - page not found
app.use((req, res) => {
  res.status(404).render('error', { title: 'Not Found', message: 'Page not found.' });
});

// Error handler (Express 5 forwards errors from async controllers here automatically)
app.use((err, req, res, next) => {
  if (err.name === 'CastError') {
    // invalid MongoDB id in the URL
    return res.status(404).render('error', { title: 'Not Found', message: 'Record not found.' });
  }
  console.error(err);
  res.status(500).render('error', { title: 'Error', message: 'Something went wrong.' });
});

module.exports = app;
