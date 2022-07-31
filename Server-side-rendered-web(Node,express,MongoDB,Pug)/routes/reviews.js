const ReviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const Review = require('../models/reviewModel');

const router = require('express').Router({ mergeParams: true });

router.use(authController.authenticate);

router
  .route('/')
  .get(ReviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    ReviewController.setUserTourIds,
    ReviewController.createReview
  );

router
  .route('/:id')
  .get(ReviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    ReviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    ReviewController.deleteReview
  );

module.exports = router;
