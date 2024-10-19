const express = require('express');

const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const routers = express.Router();

routers.get(
  '/checkout-session/:tourID',
  authController.protect,
  bookingController.getCheckoutSession
);

routers.use(authController.protect);

routers
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBookings);

routers
  .route('/:id')
  .get(bookingController.getBookings)
  .patch(bookingController.updateBookings)
  .delete(bookingController.deleteBookings);

module.exports = routers;
