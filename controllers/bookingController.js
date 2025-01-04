const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../model/tourModel');
const PayU = require('payu-sdk-test/lib/payu');
const Booking = require('./../model/bookingModel');
const factory = require('./handelerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const payuClient = new PayU(
    {
      key: process.env.PAYU_KEY,
      salt: process.env.PAYU_SALT,
    },
    'TEST'
  );

  const tour = await Tour.findById(req.params.tourID);

  const book = await Booking.create({
    tour: tour.id,
    user: req.user.id,
    price: tour.price * 100,
  });

  const paymentData = {
    // Total amount for the transaction
    amount: tour.price * 100,
    phone: '9999999999',
    productinfo: tour.name, // Product information
    firstname: req.user.name, // Customer's first name
    email: req.user.email, // Customer's email
    txnid: book._id, // Unique transaction ID
    surl: `${req.protocol}://${req.get('host')}/me`, // Success URL
    furl: `${req.protocol}://${req.get('host')}/me`, // Failure URL
  };

  const session = payuClient.paymentInitiate(paymentData);

  res.status(200).send(session);
});

exports.bookingSuccess = catchAsync(async (req, res) => {
  const { txnid, status } = req.body;

  await Booking.findByIdAndUpdate(
    txnid,
    {
      paid: status === 'success',
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.redirect(302, `/me-get?status=${status}&txnid=${txnid}`);
});

exports.createBookings = factory.createOne(Booking);

exports.getAllBookings = factory.getAll(Booking);

exports.getBookings = factory.getOne(Booking);

exports.updateBookings = factory.updateOne(Booking);

exports.deleteBookings = factory.deleteOne(Booking);
