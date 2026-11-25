// Supplier model.
// Relationship: MANY suppliers <-> MANY products (many-to-many).
// The link is stored on the Product side as an array (product.suppliers).
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s()]{7,20}$/, 'Please enter a valid phone number']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);
