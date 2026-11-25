// Turns Mongoose validation / duplicate-key errors into a simple list of messages
// that can be shown on a form. Returns null for any other kind of error.
function getErrors(err) {
  if (err.name === 'ValidationError') {
    return Object.values(err.errors).map((e) => e.message);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return [`That ${field} is already in use.`];
  }
  return null;
}

module.exports = getErrors;
