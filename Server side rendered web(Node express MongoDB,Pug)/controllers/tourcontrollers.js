// const fs = require("fs");
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf8')
// )

// exports.checkID = (req, res, next, val) => {
//     console.log(`Tour id is ${val}`);
//     if (req.params.id * 1 > tours.length) {
//         // if it comes Here , it wont call next as return statement finishes function
//         return res.status(404).json({
//             status: 'error',
//             message: 'invalid Id'
//         })
//     }
//     next();
// }

// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(500).json({
//             status: 'fail',
//             message: 'no name or price'
//         })
//     }
//     next();
// }

// exports.getallTours = (req, res) => {
//     res.status(200).json({
//         status: 'success',
//         request_time: req.request_timinggggggg,
//         total_results: tours.length,
//         data: {
//             tours
//         }
//     })
// }

// exports.getTour = (req, res) => {
//     const id = req.params.id * 1;
//     const tour = tours.find(el => el.id === id);
//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     })
// }

// exports.newTour = (req, res) => {
//     console.log(req.body);
//     const newId = tours[tours.length - 1].id + 1;
//     const newTour = Object.assign({ id: newId }, req.body);
//     tours.push(newTour);
//     fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
//         if (err) { console.log(err); }
//         res.status(201).json({
//             status: 'successfully added the below new tour',
//             data: {
//                 tour: newTour
//             }
//         })
//     })
// }

// exports.updateTour = (req, res) => {
//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour: '<updated tour>'
//         }
//     })
// }

// exports.deleteTour = (req, res) => {
//     res.status(204).json({
//         status: 'success',
//         data: null
//     });
// }

const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const handlerFactory = require('./handlerFactory');

//mongoose docs v6: https://mongoosejs.com/docs/api/query.html
// Query.prototype.find()
// Query.prototype.findOne()
// Query.prototype.findOneAndDelete()
// Query.prototype.findOneAndRemove()
// Query.prototype.findOneAndReplace()
// Query.prototype.findOneAndUpdate()

exports.aliasTopfiveTours = (req, res, next) => {
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = 5;
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getallTours = handlerFactory.getAll(Tour);
exports.getTour = handlerFactory.getOne(Tour, { path: 'reviews' });
exports.newTour = handlerFactory.createOne(Tour);
exports.updateTour = handlerFactory.updateOne(Tour);
exports.deleteTour = handlerFactory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty', //property is must and should _id.
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgRating: 1 },
    },
    {
      $match: { _id: { $ne: 'easy' } },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  console.log(year);
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numberOfTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numberOfTours: -1 },
    },
    //   {
    //  //limiting no.of docs:
    //     $limit:6
    //   }
  ]);
  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latitudeLongitude, unit } = req.params;
  const latitude = latitudeLongitude.split(',')[0];
  const longitude = latitudeLongitude.split(',')[1];
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!latitude || !longitude) {
    return next(new AppError('Please provide Longitude and Latitude', 400));
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  });
  res.status(200).json({
    results: tours.length,
    tours: tours,
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latitudeLongitude, unit } = req.params;
  const latitude = latitudeLongitude.split(',')[0];
  const longitude = latitudeLongitude.split(',')[1];
  const Multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!latitude || !longitude) {
    return next(new AppError('Please provide Longitude and Latitude', 400));
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [longitude * 1, latitude * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: Multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);
  res.status(200).json({
    results: distances.length,
    distances: distances,
  });
});
