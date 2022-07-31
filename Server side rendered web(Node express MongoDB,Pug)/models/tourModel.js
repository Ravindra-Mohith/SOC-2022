const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour must contain a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A name must be at most 40 characters'],
      minlength: [10, 'A name must be at least 10 characters'],
      //read from imported package validator documentation for further info.
      // validate: [validator.isAlpha, 'Tour must contain only alpha characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A Tour must contain a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must contain a maximum group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must contain a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be either easy,medium or diffcult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A rating must be greater than or equal to 1'],
      max: [5, 'A rating must be less than or equal to 5'],
      set: (value) => Math.round(value * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A Tour must contain a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount({VALUE}) must be less than actual price',
      },
    },
    summary: {
      type: String,
      trim: true,
      //trim is valid only in string type.
    },
    description: {
      type: String,
      required: [true, 'A Tour must contain a description'],
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour must contain an image cover'],
      trim: true,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // //for hiding the property:
      // select: false
    },
    startDates: [Date],
    secret: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number], //longitude,then latitude
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: [Number], //longitude,then latitude
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
    //real populate:
    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review',
    //   }
    // ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationInWeeks').get(function () {
  return this.duration / 7;
});
//virtual populate:
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'Tour',
  localField: '_id',
});

//MIDDLEWARE:runs before .... only works for.save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
tourSchema.pre('save', function (next) {
  console.log('saving this document..');
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});
//query MIDDLEWARE:
tourSchema.pre(/^find/, function (next) {
  //every query starting with find:(/^find/)
  this.find({ secret: { $ne: true } });
  next();
});

//Post middleware:
//this will have access to saved doc along with next();
tourSchema.post('save', function (doc, next) {
  console.log('final doc:', doc);
  next();
});

//aggregate middleware:
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secret: { $ne: true } } });
//   // console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
