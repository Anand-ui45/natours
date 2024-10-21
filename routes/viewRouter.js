const express = require('express');
const routers = express.Router();
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');

const bookingController = require('./../controllers/bookingController');

routers.get('/', authController.isLoged, viewController.getOverview);

routers.get('/tour/:slug', authController.isLoged, viewController.getTour);

routers.get('/login', authController.isLoged, viewController.loginUser);

routers.post('/me', bookingController.bookingSuccess);

routers.get('/me-get', async (req, res) => {
  if (req.query.status === 'success') {
    return res.status(200).render('paySuccess');
  } else {
    return res.status(200).render('payFail');
  }
});

routers.get('/signup', viewController.signUp);

routers.get('/me', authController.protect, viewController.getAccount);

// routers.post(
//   '/submit-user-data',
//   authController.protect,
//   viewController.updateUserData
// );

module.exports = routers;
