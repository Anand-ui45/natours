const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have name'],
    trim: true,
    maxlength: [30, 'A name must be less than or equal to 30'],
    minlength: [4, 'A name must be in greater than or eqaul to 4'],
  },

  email: {
    type: String,
    required: [true, 'A user must have a vaild email id'],
    trim: true,
    maxlength: [40, 'A email must be less than or equal to 40'],
    minlength: [8, 'A email must be greater than or equal to 8'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function (value) {
        // Regular expression to validate email with stricter domain

        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/.test(value);
      },
      message: 'Please provide a valid email with a proper domain',
    },
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'guide', 'lead-guide', 'admin'],
      message: 'A role must be user, guide, lead-guide or admin',
    },
    default: 'user',
  },
  photo: {
    type: String,
    default:'default.jpg'
  },
  password: {
    type: String,
    required: [true, 'A password is must for user '],
    trim: true,
    maxlength: [16, 'A password must be less than or equal to 16'],
    minlength: [8, 'A password must be greater than or equal to 8'],
    select: false,
  },
  passwordConfrim: {
    type: String,
    required: [true, 'A user must confrim their password in order to proceed'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'your pasword not matched',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // if the password already hashed then return it return sudenly
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfrim = undefined;
  next();
});

userSchema.pre('save', function (next) {
  // if the password already hashed then return it return sudenly
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  return next();
});

userSchema.pre(/^find/, function (next) {
  //select only the active user
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return jwtTimeStamp < passwordTimeStamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log(
    { resetToken },
    this.passwordResetToken,
    this.passwordResetExpires
  );
  return resetToken;
};

const User = new mongoose.model('User', userSchema);

module.exports = User;
