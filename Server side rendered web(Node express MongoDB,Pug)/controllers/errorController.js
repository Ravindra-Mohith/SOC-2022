const AppError = require('./../utils/appError');

const CastErrorDB = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};
const DuplicateErrorDB = (err) => {
  const value = Object.keys(err.keyValue)[0];
  return new AppError(
    `Duplicate field value: "${value}" .. please use another value!`,
    400
  );
};
const ValidationErrorDB = (err) => {
  const errors = Object.values(err.errors)
    .map((el) => el.message)
    .join(',');
  return new AppError(`Invalid input data: ${errors}`, 400);
};
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      errorStack: err.stack,
    });
  } else
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
};

const sendErrorProd = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    //operational ,trusted error.
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } //programmer or logical error (won't leak other details).
    else {
      //1)logging in the console to suspect it.
      console.log(err);

      //2)send generic message to client.
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
      });
    }
  }
  if (err.isOperational) {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  } //programmer or logical error (won't leak other details).
  else {
    //1)logging in the console to suspect it.
    console.log(err);

    //2)send generic message to client.
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: 'Please try again later.',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message=err.message
    // removing cast errors:
    if (error.name === 'CastError') {
      error = CastErrorDB(error);
    }
    //removing duplicate errors:
    if (error.code === 11000) {
      error = DuplicateErrorDB(error);
    }
    //removing validation errors:
    if (err.name === 'ValidationError') {
      error = ValidationErrorDB(error);
    }
    if (err.name === 'TokenExpiredError') {
      error = new AppError('Your session has expired', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      error = new AppError('invalied token.please log in again!', 401);
    }

    sendErrorProd(error, req, res);
  } else if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  }
};
