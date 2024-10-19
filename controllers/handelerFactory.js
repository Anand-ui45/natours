const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIfeatuers = require('./../utils/apiFeatuers');

//direcetly return this function
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document fonud by this id', 400)); // 400 for Bad Request
    }

    res.status(204).json({ status: 'sucess', message: 'deleted' });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!newDoc) {
      return next(new AppError('No document fonud by this id', 400)); // 400 for Bad Request
    }
    res.status(201).json({ status: 'sucess', data: newDoc });
  });

  
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({ status: 'sucess', data: doc });
  });

exports.getOne = (Model, popOptins) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptins) query = query.populate(popOptins);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found by this id', 404)); // 404 page not found
    }

    res.status(200).json({ status: 'sucess', data: doc });
  });
};

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const queryed = new APIfeatuers(Model.find(filter), req.query)
      .fillter()
      .Sorting()
      .fieldsLimit()
      .pagenation();
    const docs = await queryed.query;

    if (docs.length === 0)
      return next(new AppError('invalid query try the valid one', 400));
    // Step 9: Send response
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: docs,
    });
  });
