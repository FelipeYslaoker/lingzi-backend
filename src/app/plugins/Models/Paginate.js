const Paginate = async ({
  model, filters, limit, page, sort = { createdAt: 'desc' }
}) => {
  // const searchString = decodeURI(req.query.search);
  // const docsLength = await model.countDocuments().exec();
  const startIndex = (page - 1) * limit

  const result = {}
  // if (docsLength === 0) {
  //   return res.send();
  // }
  // if (page > Math.ceil(docsLength / limit))
  //   return res.status(400).send();
  try {
    // if (req.query.search) {
    // const docsLength = await model.find({ name: { $regex: `${searchString}`, $options: 'i' } }).countDocuments().exec();
    // result.totalItems = docsLength;
    // result.results = await model.find({ name: { $regex: `${searchString}`, $options: 'i' } }).limit(limit).skip(startIndex).sort({ createdAt: -1 }).exec();
    // } else {
    const docsLength = await model.find(filters).countDocuments()
    result.items = await model.find(filters).limit(limit).skip(startIndex).sort(sort)
    result.totalItems = docsLength
    // }
    return result
  } catch (e) {
    throw e
  }
}

module.exports = Paginate
