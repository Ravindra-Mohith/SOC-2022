const promisify = require('util').promisify;
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('./../utils/email');

const signToken = (Id) => {
  return jwt.sign({ id: Id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  httpOnly: true,
};

exports.signup = catchAsync(async (req, res) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    ConfirmPassword: req.body.ConfirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
});

exports.login = async (req, res, next) => {
  const Email = req.body.email;
  const Password = req.body.password;

  //1) check if email and password exists
  if (!Email || !Password) {
    const err = new AppError('please enter email and password', 400);
    return next(err);
    //return is used because: due to global appError handler,it will send a response. and again below, there is another token response sent. to fix that we use return which terminates here.
  }
  //2)check if user exists and password is correct
  const user = await User.findOne({ email: Email }).select('+password');

  if (!user) {
    return next(new AppError('user not found', 401));
  }
  const verify = await user.checkPassword(Password, user.password);
  if (!verify) {
    return next(new AppError('invalid email or password', 401));
  }

  //3)check if everything is okay, then send the token to client.

  const token = signToken(user.id);
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(201).json({
    status: 'success',
    user: user,
    token: token,
  });
};

exports.authenticate = catchAsync(async (req, res, next) => {
  let token;
  //getting the token if its there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('you are not logged in', 401));
  }

  //verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if the user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('the token belonging to the user no longer exists', 401)
    );
  }
  console.log('e');
  //if user changed password after JWT is issued
  if (freshUser.ifpasswordChanged(decoded.iat)) {
    return next(new AppError('Recently, the password has changed!', 401));
  }

  // req.user = freshUser;
  res.locals.user = freshUser;
  console.log('e');
  // console.log(req.locals, res);
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      console.log('a');

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      console.log('a');

      // 3) Check if user changed password after the token was issued
      if (currentUser.ifpasswordChanged(decoded.iat)) {
        return next();
      }
      console.log('a');

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'LoggedOut!', {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000),
  });
  res.status(200).json({
    status: 'success',
  });
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles =['admin','lead-guide']
    // remeber we passsed the req.user= freshUser in the previous middleware function, so we can get access to user data in this middleware function too.
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action!', 403)
      );
    }
    next();
  };
};

exports.forgotpassword = catchAsync(async (req, res, next) => {
  //get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new AppError('There is no user with email ' + req.body.email, 404));
  }
  //generate random reset token
  const token = user.createRandomResetToken();
  await user.save({ validateBeforeSave: false });
  // send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword/${token}`;
  const message = `Your Reset token url:${resetURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'your reset token(valid for 10 mins)',
      message: message,
    });
  } catch (e) {
    console.log(e);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error in resetting ur password!,Try again later.',
        500
      )
    );
  }
  res.status(200).json({
    status: 'success',
    message: 'token sent successfully!',
  });
  // next();
});
exports.resetpassword = catchAsync(async (req, res, next) => {
  //1)get user based token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  //if token has not exepired then we need to ask the user
  if (!user) {
    return next(new AppError('your token had expired!', 404));
  }
  user.password = req.body.password;
  user.ConfirmPassword = req.body.ConfirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  //log user in by sending jwt:
  const token = signToken(user._id);
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(200).json({
    status: 'success',
    token: token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //get user from collection
  const user = await User.findById(req.user.id).select('+password');

  //check posted current password is correct
  if (!user.checkPassword(req.body.currentpassword, user.password)) {
    return next(new AppError('Incorrect passsword!', 401));
  }
  //if so, update password
  user.password = req.body.newpassword;
  user.ConfirmPassword = req.body.confirmnewpassword;
  await user.save();
  const token = signToken(user._id);
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  //create jwt and log the user in
  res.status(201).json({
    status: 'success',
    message: 'password updated successfully',
    token: token,
  });
});

exports.SIGNUP = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    ConfirmPassword: req.body.ConfirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

});
