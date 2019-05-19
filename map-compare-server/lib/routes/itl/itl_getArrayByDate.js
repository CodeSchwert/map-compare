const { DateTime } = require('luxon');
const mongoose = require('mongoose');
const ITL = mongoose.model('ITL');

/**
 * @name itl_getArrayByDate
 * @description Returns an array of ITL's with images from the given date
 * @path {GET} routePrefix + /itl/date
 * @query {String} project - Required. Get all ITL from this project
 * @param {Number} date - Required. Needs to be a valid date string
 * @code {200} Query completed successfully
 * @code {400} Date parameter missing or incorrect format
 * @code {500} Server error
 * @response {Object[]} - An array of ITL objects
 * @example GET /itl/array?project=foo&itls=10&itls=15
 */
const itlGetArrayByDate = async (req, res) => {
  try {
    if (!req.query.project || req.query.project.length == 0) {
      return res.status(400).send('Query parameter "project" empty or missing.');
    }
    if (!req.params.date) {
      return res.status(400).send('Date string parameter missing.');
    }

    const { project } = req.query;
    const { date } = req.params;

    // validate date is correct format
    if (date.match(/^[0-9]{8}$/) == null) {
      return res.status(400).send('Incorrect date parameter format.');
    }

    // validate date
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    const dateTime = DateTime.utc(Number(year), Number(month), Number(day));

    if (dateTime.isValid) { // query
      const itls = await ITL.find({ project, dates: date });

      return res.status(200).send(itls);
    } else { // error
      return res.status(400).send('Invalid date.')
    }

  } catch (e) {
    return res.status(500).send(e);
  }
  
};

module.exports = itlGetArrayByDate;
