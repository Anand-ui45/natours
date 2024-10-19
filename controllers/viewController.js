const Tour = require('./../model/tourModel');
const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async (req, res) => {
  //get data from tours data tabe
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'Overview',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //select data form the tours table

  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review user rating',
  });

  if (!tour) {
    return next(new AppError('There is no page in that name', 404));
  }
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.loginUser = catchAsync(async (req, res) => {
  res.status(200).render('login', { title: 'login-page' });
});

exports.getAccount = catchAsync(async (req, res) => {
  res.status(200).render('account', {
    title: req.user.name,
  });
});

exports.updateUserData = catchAsync(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runvalidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'your Account',
    user: updatedUser,
  });
});
