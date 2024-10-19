const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'A tour is must for the booking'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A user must for the booking'],
  },
  paid: {
    type: Boolean,
  },
  price: {
    type: Number,
    required: [true, 'a true must have a price'],
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
