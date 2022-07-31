class APIFeatures {
  constructor(PureQueryObject, QueryObject) {
    this.pureQueryObj = PureQueryObject;
    this.queryObj = QueryObject;
    this.negligibleQueryParams = ['page', 'limit', 'fields', 'sort'];
  }

  //Modification 1:FILTERING.
  Filter() {
    //1) Basic Filtering:
    for (let el of this.negligibleQueryParams) {
      delete this.queryObj[el];
    }
    //queryObj filters all the negligible params and displays only asked ones,whereas,pureQueryObj will display whole query

    //2) Advanced Filtering:

    //get req:http://localhost:5000/api/v1/tours?difficulty=easy&duration[gte]=5
    //its queryobj equivalent to { difficulty: 'easy', duration: { '$gte': '5' } }
    let queryString = JSON.stringify(this.queryObj);
    queryString = queryString.replace(
      /\b(lt|gt|lte|gte)\b/g,
      (operator /*lt|gt|lte|gte*/) => `$${operator}`
    );
    this.queryObj = JSON.parse(queryString);
  }

  //Modification 2:SORTING.
  Sort(query) {
    // look here for a detailed desc of mongoose's query.sort() method: https://mongoosejs.com/docs/api/query.html#query_Query-sort
    if (this.pureQueryObj.sort) {
      const criteria = this.pureQueryObj.sort.split(',').join(' ');
      //this splits at ',' and returns an array. we joined that array in a single string with a space in btwn by join fn.
      console.log(criteria);
      query = query.sort(criteria);
      //actulally, for multiple criteria, our aim is to make sure that Query.prototype.sort('c1 c2 c3') where c1,c2,c3 are criteria.
    }
  }

  //Modification 3:FIELD LIMITING.
  Field_limit(query) {
    if (this.pureQueryObj.fields) {
      const limitingFields = this.pureQueryObj.fields.split(',').join(' ');
      query = query.select(limitingFields);
    }
    // else{
    //     query=query.select('_id');
    // }
  }

  //Modification 4:PAGINATION.
  Pagination(query) {
    const page = this.pureQueryObj.page * 1 || 1;
    const limit = this.pureQueryObj.limit * 1 || 100;
    query = query.skip((page - 1) * limit).limit(limit);
    //throwing error when the user accessed null page to catch block:
    // if (this.pureQueryObj.page) {
    //   const numTours = await Tour.countDocuments(); //inbuilt fn.
    //   if ((page - 1) * limit >= numTours) {
    //     throw new Error('The page you are trying to access doesnt exists');
    //   }
    // }
  }
}

module.exports = APIFeatures;
