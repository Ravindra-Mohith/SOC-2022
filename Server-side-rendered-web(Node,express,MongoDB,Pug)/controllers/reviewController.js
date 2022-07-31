const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const handlerFactory = require('./handlerFactory');

exports.setUserTourIds = catchAsync(async (req, res, next) => {
  if (!req.body.Tour) req.body.Tour = req.params.tourId;
  if (!req.body.User) req.body.User = req.user.id;
  next();
});

exports.createReview = handlerFactory.createOne(Review);
exports.getAllReviews = handlerFactory.getAll(Review);
exports.deleteReview = handlerFactory.deleteOne(Review);
exports.updateReview = handlerFactory.updateOne(Review);
exports.getReview = handlerFactory.getOne(Review);
