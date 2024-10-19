const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const multer = require('multer');
const sharp = require('sharp');
const factory = require('./handelerFactory');

// const upload = multer({ dest: 'public/img/users' });

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     const photo = `user-${req.user.id}-${Date.now()}.${ext}`;
//     cb(null, photo);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('Not an image! please upload only image files', 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const fillterObj = (obj, ...alowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (alowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.uploadPhoto = upload.single('photo');

exports.resizeUser = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //navigate the user to correct path
  if (req.body.password || req.body.passwordConfrim) {
    return next(
      new AppError(
        'this route is not for changing password. So use /changePassword',
        404
      )
    );
  }
  //fillter the unwanted fields
  const fillterBody = fillterObj(req.body, 'name', 'email');
  if (req.file) fillterBody.photo = req.file.filename;
  //update the user from fillterBody
  const updatedUser = await User.findByIdAndUpdate(req.user.id, fillterBody, {
    new: true,
    runValidators: true,
  });

  //send response back to the client

  res.status(201).json({
    status: 'success',
    user: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = factory.getOne(User);

exports.createUser = factory.createOne(User);

exports.updateUser = factory.updateOne(User);

exports.DeleteUser = factory.deleteOne(User);

exports.getAllusers = factory.getAll(User);
