const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) return next(new AppError(`${Model} not found with that ID`, 404));

    await Model.findByIdAndDelete({ _id: req.params.id });

    res.status(204).json({
      status: 'success',
      data: {
        // deletedDoc: deletedDoc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError(`${Model} not found with that ID`, 404));

    res.status(200).json({
      status: 'success',
      data: {
        updates: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newdoc = await Model.create(req.body);

    res.status(200).json({
      status: 'success',
      data: {
        new_doc_created: newdoc,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    console.log(populateOptions);
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const doc = await query;

    if (!doc) return next(new AppError(`${Model} not found with that ID`, 404));

    res.status(200).json({
      status: 'success',
      data: {
        found: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    let filter = {};
    //if the route gets through the tour routes and askes get request by passing tourId in its params,
    if (req.params.tourId) filter = { Tour: req.params.tourId };
    let query = Model.find(filter);
    //if we imported class API featuers from utils,
    // --------------------------------------------------------------------
    // then, only this code:
    //<------------  const pureQueryObj = req.query;
    // let queryObj = { ...req.query };
    // let QUERY = new APIFeatures(pureQueryObj, queryObj);

    // let query = Tour.find(queryObj);

    // QUERY.Filter();
    // QUERY.Sort(query);
    // QUERY.Field_limit(query);
    // QUERY.Pagination(query); --------------->
    //---------------------------------------------------------------------------
    //else:

    //BUILDING QUERY:

    //Modification 1:FILTERING.
    //1) Basic Filtering:
    const pureQueryObj = req.query;
    let queryObj = { ...req.query };
    negligibleQueryParams = ['page', 'limit', 'fields', 'sort'];
    for (let el of negligibleQueryParams) {
      delete queryObj[el];
    }
    //queryObj filters all the negligible params and displays only asked ones,whereas,pureQueryObj will display whole query

    //2) Advanced Filtering:
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(lt|gt|lte|gte)\b/g,
      (operator /*lt|gt|lte|gte*/) => `$${operator}`
    );
    queryObj = JSON.parse(queryString);

    //get req:http://localhost:5000/api/v1/tours?difficulty=easy&duration[gte]=5
    //its queryobj equivalent to { difficulty: 'easy', duration: { '$gte': '5' } }

    query = query.find(queryObj);

    //Modification 2:SORTING.

    // look here for a detailed desc of mongoose's query.sort() method: https://mongoosejs.com/docs/api/query.html#query_Query-sort
    if (pureQueryObj.sort) {
      const criteria = pureQueryObj.sort.split(',').join(' ');
      //this splits at ',' and returns an array. we joined that array in a single string with a space in btwn by join fn.
      query = query.sort(criteria);
      //actulally, for multiple criteria, our aim is to make sure that Query.prototype.sort('c1 c2 c3') where c1,c2,c3 are criteria.
    }

    //Modification 3:FIELD LIMITING.
    if (pureQueryObj.fields) {
      const limitingFields = pureQueryObj.fields.split(',').join(' ');
      query = query.select(limitingFields);
    }
    // else{
    //     query=query.select('_id');
    // }

    //Modification 4:PAGINATION.
    const page = pureQueryObj.page * 1 || 1;
    const limit = pureQueryObj.limit * 1 || 100;
    query = query.skip((page - 1) * limit).limit(limit);
    //throwing error when the user accessed null page to catch block:
    if (pureQueryObj.page) {
      const numDocs = await Model.countDocuments(); //inbuilt fn.
      if ((page - 1) * limit >= numDocs) {
        throw new Error('The page you are trying to access doesnt exists');
      }
    }

    //EXCECUTION OF QUERY:
    const docs = await query;

    //SENDING RESPONSE:
    res.status(200).json({
      status: 'success',
      request_time: req.request_timinggggggg,
      results: docs.length,
      data: {
        docs,
      },
    });
  });
