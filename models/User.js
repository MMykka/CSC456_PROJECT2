// User model - used for authentication (login/register) and roles.
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // never returned in queries unless explicitly requested
    },
    role: {
      type: String,
      enum: { values: ['admin', 'employee'], message: 'Role must be admin or employee' },
      default: 'employee'
    }
  },
  { timestamps: true }
);

// Hash the password with bcrypt before saving (only when it was changed).
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10); // 10 salt rounds
});

// Compare a plain-text password with the stored hash.
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
