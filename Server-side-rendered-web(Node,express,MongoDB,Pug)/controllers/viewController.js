const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    tours,
  });
});
exports.get = (req, res) => {
  res.status(200).render('base', {
    title: 'Natours',
  });
};

exports.getTour = catchAsync(async (req, res, next) => {
  const name = req.params.slug;
  const tour = await Tour.findOne({ slug: name }).populate({
    path: 'reviews',
    select: 'review rating -Tour',
  });
  if (!tour) {
    return next(new AppError('No Tour Found with that name!', 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLogin = (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
    user: res.locals.user,
  });
};

exports.getMe = (req, res) => {
  res.status(200).render('account', {
    title: 'Account Settings',
    user: res.locals.user,
  });
};

exports.signup = (req, res) => {
  res.status(200)
}