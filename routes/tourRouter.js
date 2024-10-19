const express = require('express');
const tourController = require('./../controllers/tourController');
const routers = express.Router();
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRouter');
// routers.param('id', tourController.checkedId);

//this means when ever this route called by a client it re direct to reviewRouter
routers.use('/:tourId/reviews', reviewRouter);

routers
  .route('/top-10-best-tour')
  .get(tourController.aliasTopTour, tourController.getAllTours);
routers
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.verifyRole('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );
routers.route('/stats').get(tourController.tourStats);

routers
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.toursWithIn);

routers.route('/distance/:latlng/unit/:unit').get(tourController.getDistances);

routers
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.verifyRole('admin', 'lead-guide'),
    tourController.createTour
  );
routers
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.verifyRole('admin', 'lead-guide'),
    tourController.tourImages,
    tourController.resizeTour,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.verifyRole('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = routers;
