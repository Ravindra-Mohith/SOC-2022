const AppError = require('../utils/AppError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const handlerFactory = require('./handlerFactory');

const FilterObj = (obj, ...allowedFields) => {
  newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.ConfirmPassword) {
    return next(new AppError('updating password here is not allowed!', 400));
  }
  //update user doc:
  const data = FilterObj(req.body, 'name', 'email');
  const Updateduser = await User.findByIdAndUpdate(
    req.user.id,
    data /*req.body is restricted here bcoz user can change his role to admin easily*/,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'your details are updated successfully',
    newDetails: Updateduser,
  });
});

exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { status: 'inactive' });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

//Do Not CHANGE PASSWORDS with this!!
exports.updateUser = handlerFactory.updateOne(User);
exports.getallUsers = handlerFactory.getAll(User);
exports.getUser = handlerFactory.getOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);
