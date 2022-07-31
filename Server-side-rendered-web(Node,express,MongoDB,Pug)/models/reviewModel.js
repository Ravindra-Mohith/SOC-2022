const mongoose = require('mongoose');
const Tour = require('./../models/tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review Can't be empty"],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be atleast 1'],
      max: [5, 'Rating must be atmost 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    User: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to user'],
    },
    Tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ Tour: 1, User: 1 }, { unique: true });
reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'Tour',
  //     select: 'name',
  //   }).populate({
  //     path: 'User',
  //     select: 'name photo',
  //   });
  this.populate({
    path: 'User',
    select: 'name photo',
  });
  next();
});

//document middlewares
reviewSchema.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { Tour: tourId },
    },
    {
      $group: {
        _id: '$Tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.Tour);
});

reviewSchema.post(/^findOneAnd/, async function (currentreview) {
  //currentreview is the first parameter which post middleware gets and we can access it.:)
  //await this.findOne(); does not work here coz query had already been executed. no access to query
  await currentreview.constructor.calcAverageRating(currentreview.Tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
