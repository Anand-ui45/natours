// class AppError extends Error {
//   constructor(message, statusCode) {
//     super(message);
//     this.statusCode = statusCode || 500;
//     this.status = `${statusCode}`.startsWith('4')
//       ? 'fail'
//       : 'An uncaught Error';
//     this.oprational = true;

//     Error.captureStackTrace(this, this.construtor);
//   }
// }

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
