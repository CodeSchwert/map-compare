const mongoose = require('mongoose');
const ITL = mongoose.model('ITL');

/**
 * @name itl_getArrayByNumbers
 * @description Get an array of ITL objects by array of ITL numbers
 * @path {GET} routePrefix + /itl/array
 * @query {String} project - Required. Get all ITL from this project
 * @query {String[]} itls - Required. ITL numbers to query
 * @code {200} Query completed successfully
 * @code {400} Parameters missing or incorrect
 * @code {500} Server error
 * @response {Object[]} - An array of ITL objects
 * @example GET /itl/array?project=foo&itls=10&itls=15
 */
const itlGetArrayByNumbers = async (req, res) => {
  try {
    if (!req.query.project || req.query.project.length == 0) {
      return res.status(400).send('Query parameter "project" empty or missing.');
    }
    if (!req.query.itls) {
      return res.status(400).send('ITL query parameter missing.');
    }

    const { itls, project } = req.query;

    // validate req.query.itls is an array otherwise create array from param
    const validArray = itls instanceof Array ? itls : [itls];

    // filter out empty strings from the array and convert values to numbers
    // e.g. ['12345', '', 'abcd'] = ['12345']
    const parsedArray = [];
    for (let stringVal of validArray) {
      if (Boolean(stringVal) && stringVal.match(/^[0-9]+$/))
        parsedArray.push(Number(stringVal));
    }

    const itlArray = await ITL.find({ project, number: { $in: parsedArray } });
    
    res.status(200).send(itlArray);
  } catch (e) {
    res.status(500).send(e)
  }
};

module.exports = itlGetArrayByNumbers;
