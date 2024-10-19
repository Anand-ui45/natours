const mongoose = require('mongoose');
const slugs = require('slugify');

// These tour modeling validators are only works in save() or create situation
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have name'],
      unique: true,
      trim: true,
      maxlength: [30, 'A name must be less than or equal to 30'],
      minlength: [3, 'A name must be in greater than or eqaul to 3'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a name '],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a grop size'],
    },

    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, or hard',
      },
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 4.6,
      min: [1, 'A rating must be greater than 1.0'],
      max: [5, 'A rating must be less than 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price * 0.75;
        },
        message: `A discount must 75% it is way too much({VALUE})`,
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover img'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],

    startLocation: {
      //it is GeoJson it is used to store location cordinates
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },

    locations: [
      {
        //it is GeoJson it is used to store location cordinates
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// this virtual field it only appers in get request and it not going to save in our data base
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//Document middle ware using next in this function not nessary because now we have one middle ware but using next is a best practice
tourSchema.pre('save', function (next) {
  this.slug = slugs(this.name, { lower: true });
  next();
});

tourSchema.post('save', function (doc, next) {
  console.log(`${doc.slug} file is saved`);
  next();
});

//this is the way to we impelent embed data from another table

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//query midlle ware

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(`the query took ${Date.now() - this.start}`);

  next();
});

//aggregation middle ware

tourSchema.pre('aggregate', function (next) {
  const pipe = this.pipeline();
  const querys = Object.keys(pipe[0]);

  if (querys[0] === '$geoNear') {
    this.pipeline().push({
      $match: { secretTour: { $ne: true } },
    });
  } else {
    this.pipeline().unshift({
      $match: { secretTour: { $ne: true } },
    });
  }

  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
