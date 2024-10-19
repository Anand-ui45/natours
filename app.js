const express = require('express');
const path = require('path');
const AppError = require('./utils/appError');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const compression = require('compression');
const hpp = require('hpp');
const app = express();
const rateLimt = require('express-rate-limit');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorController = require('./controllers/errorController');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const bookingRouter = require('./routes/bookingRouter');
const viewRouter = require('./routes/viewRouter');
const contentSecurity = require('./utils/contenSecurity');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//Global middle ware functions
//serveing static files
app.use(express.static(path.join(__dirname, 'public')));
//security security http

// app.use(helmet.contentSecurityPolicy(contentSecurity.obj));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//limit the data coming from the user via json
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
//data sanitization aganist the noSql injection
app.use(mongoSanitize());
//data sanitization aganist the XSS Attacks

app.use(
  xss({
    allowedTags: [''],
  })
);

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

const limter = rateLimt({
  max: 100,
  windowMs: 60 * 60 * 100,
  message: 'too many requset from this ip so please try agian later',
});

app.use('/api', limter);

app.use(compression());

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/reviews', reviewRouter);
// app.get('/', starting);

//this route for all undefiend route and misspelled route
app.all('*', (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404);
  next(err);
});
app.use(errorController);
module.exports = app;
