const tourController = require(`${__dirname}/../controllers/tourcontrollers`);
const express = require('express');
const router = express.Router();
const reviewRouter = require('./../routes/reviews');
const authController = require('./../controllers/authController');
// const reviewController = require('./../controllers/reviewController');
//Param Middleware:

// router.param('id', tourController.checkID);
//routes:

//Note:aliases must be at top(as order matters)
router
  .route('/top-5-tours')
  .get(tourController.aliasTopfiveTours, tourController.getallTours);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/get-monthly-plan/:year')
  .get(
    authController.authenticate,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );
router.get(
  '/tours-within/:distance/center/:latitudeLongitude/unit/:unit',
  tourController.getToursWithin
);
router.get('/distance/:latitudeLongitude/unit/:unit', tourController.getDistance);

router
  .route('/')
  .get(tourController.getallTours)
  .post(
    authController.authenticate,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.newTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.authenticate,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.authenticate,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.authenticate,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );
router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
