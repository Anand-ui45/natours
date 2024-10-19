const express = require('express');
//this line of code for merge the request parameter two differnt router
const routers = express.Router({ mergeParams: true });
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

routers.use(authController.protect);

routers
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.verifyRole('user'),
    reviewController.setTourUserId,
    reviewController.createReviews
  );

routers
  .route('/:id')
  .delete(
    authController.verifyRole('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.verifyRole('user', 'admin'),
    reviewController.updateReview
  )
  .get(reviewController.getReview);

module.exports = routers;
