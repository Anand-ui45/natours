const User = require('./../model/userModel');
const crypto = require('crypto');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const jwt = require('jsonwebtoken');
const Email = require('./../utils/email');
const { promisify } = require('util');
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXP_IN,
  });
};

const jwtTokenGenrator = (user, statusCode, res) => {
  const token = signToken(user.id);

  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXP_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;

  user.password = undefined;

  res.cookie('jwt', token, cookieOption);
  res.status(statusCode).json({
    status: 'success',
    user,
    token,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfrim: req.body.passwordConfrim,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  if (newUser) {
    await new Email(newUser, url).sendWelcome();
    jwtTokenGenrator(newUser, 201, res);
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //check the given email and password is actualy exist
  if (!email || !password) {
    return next(
      new AppError(
        'your must provide your email and password for further interaction',
        401
      )
    );
  }
  //check the password is correct or not
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('your password or email is incorrect', 401));
  }
  //if everythig is ok just give the response

  jwtTokenGenrator(user, 200, res);
});

exports.logOut = (req, res) => {
  res.cookie('jwt', 'loged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  //1. check the user request header for jwt token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('plesae log in or sign up to get access form here', 401)
    );
  }
  //verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  //check the user still exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    next(new AppError('User belonging to this token is no longer exist', 401));

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('user recently changed the password please login again', 401)
    );
  }
  //grant access to the portected route
  res.locals.user = freshUser;
  req.user = freshUser; // this step is must beacuse if chain you the middle ware we get information from there req Object
  next();
});

exports.isLoged = async (req, res, next) => {
  //1. check the user request header for jwt token

  if (req.cookies.jwt) {
    try {
      //verify the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // console.log(decoded);

      //check the user still exist
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) next();

      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      //there is a loged in user

      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }

  next();
};

exports.verifyRole = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new AppError(`You don't have permisson to perform this action`, 403)
      );
    }
    next();
  };
};

//#ff0000
exports.forgotpassword = catchAsync(async (req, res, next) => {
  //verify users posted email id
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user from this email', 404));
  }
  //2.cerate Random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3.create Url and some message for the email body for the reset token

  try {
    const url = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, url).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Check your email',
    });
  } catch (err) {
    user.passwordResestToken = undefined;
    user.passwordResestExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending email, try agian later', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedPassword = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  //1. find the user by compareing the usertoken and our databse hashed token;

  const user = await User.findOne({
    passwordResetToken: hashedPassword,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2.if user dosen't matched then send an error
  if (!user) {
    next(new AppError('ivalid token or expired token please try again', 400));
  }
  //3.if everything matches we should update the user new password into the data base

  user.password = req.body.password;
  user.passwordConfrim = req.body.passwordConfrim;
  user.passwordResestToken = undefined;
  user.passwordResestExpires = undefined;
  await user.save();

  //5.send response and log the user in

  jwtTokenGenrator(user, 200, res);
});

exports.changePassword = catchAsync(async (req, res, next) => {
  //1. get user from the collection

  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('your current password is inCorrect ', 401));
  }
  user.password = req.body.newPassword;
  user.passwordConfrim = req.body.passwordConfrim;
  await user.save();
  //2.login the user

  jwtTokenGenrator(user, 200, res);
});
