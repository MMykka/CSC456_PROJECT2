// Product model.
//  - category  -> one-to-many  (each product belongs to ONE category)
//  - suppliers -> many-to-many (a product has MANY suppliers, a supplier has MANY products)
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9-]{3,20}$/, 'SKU must be 3-20 letters, numbers or dashes']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      validate: { validator: Number.isInteger, message: 'Quantity must be a whole number' }
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    suppliers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
