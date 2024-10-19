const AppError = require('./../utils/appError');

const mongooseCasterr = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400); // For bad request
};
const handleDuplicateFields = (err) => {
  const value = err.errorResponse.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value:${value}. please use another value `;
  return new AppError(message, 400); // for bad request
};
const handleTokenError = () => new AppError('The please login get access', 401);

const handleExpiredtokenError = () =>
  new AppError('your valid period is expiered so please login again', 401);

const handleValidationError = (err) => {
  const value = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data ${value.join('. ')} `;
  return new AppError(message, 400); // for bad request
};

const dev = (err, req, res) => {
  console.log(err.name); //#ff0000
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      message: err.message || 'Something went wrong!',
      error: err,
      stack: err.stack,
    });
  } else {
    console.log(err.name); //#ff0000
    res.status(err.statusCode).render('error', {
      title: 'something went worng',
      msg: err.message,
    });
  }
};

const pro = (err, req, res) => {
  // Log the error in production
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message || 'Something went wrong!',
      });
    } else {
      // Log untrusted errors for debugging
      console.log('An untrusted error:', err);

      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  } else {
    if (err.isOperational) {
      console.log(err);
      res.status(err.statusCode).render('error', {
        title: 'something went worng',
        msg: err.message,
      });
    } else {
      // Log untrusted errors for debugging
      console.error('An untrusted error:', err);

      res.status(err.statusCode).render('error', {
        title: 'something went worng',
        msg: 'please try again later',
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the entire error object in production to inspect it

  if (process.env.NODE_ENV === 'development') {
    dev(err, req, res);
  } else {
    // else if statement dosen't work right so i go with else block
    console.log('entered');

    let error = Object.assign({}, err);
    error.message = err.message; // Ensure message is copied
    error.name = err.name;

    if (error.name === 'CastError') error = mongooseCasterr(error); // Handle Mongoose CastError

    if (error.code === 11000) error = handleDuplicateFields(error);

    if (error.name === 'ValidationError') error = handleValidationError(error);

    if (error.name === 'JsonWebTokenError') error = handleTokenError();

    if (error.name === 'TokenExpiredError')
      error = handleExpiredtokenError(error);

    pro(error, req, res);
  }
};
