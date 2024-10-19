class APIfeatuers {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  fillter() {
    const copy = { ...this.queryString };
    const exe = ['page', 'sort', 'limit', 'fields'];
    exe.forEach((el) => delete copy[el]);

    // Step 2: Advanced filtering
    const queryStr = JSON.stringify(copy).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    // Step 3: Build query
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  Sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  fieldsLimit() {
    if (this.queryString.fields) {
      const fieldsBy = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fieldsBy);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  pagenation() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 50;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    // Step 7: Pagination Error Handling
    // if (req.query.page) {
    //   const count = await Tour.countDocuments();
    //   if (skip >= count) throw new Error('This page does not exist');
    // }

    return this;
  }
}

module.exports = APIfeatuers;
