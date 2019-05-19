const mongoose = require('mongoose');
const ITL = mongoose.model('ITL');
const ProjectDates = mongoose.model('projectDates');

/**
 * @name itl_getAll
 * @description Get all ITL from a single project
 * @path {GET} routePrefix + /itl
 * @query {String} project - Required. Get all ITL from this project
 * @query {String} datesort - Optional. Accepts 'asc' or 'desc'. Defaults to 'desc'.
 * @code {200} Query completed successfully
 * @code {500} Server error with MongoDB
 * @response {Object} - { itls: [ Object ], dates: [ String ] }
 */
const itlGetAll = async (req, res) => {
  try {
    const { datesort, project } = req.query;

    if (!req.query.project || req.query.project.length == 0) {
      return res.status(400).send('Query parameter "project" empty or missing.');
    }
    if (req.query.datesort) {
      if (!['asc', 'desc'].includes(datesort)) {
        return res.status(400).send(
          'Query parameter "datesort" either "asc" or "desc"');
      }
    }

    const allItl = await ITL.find({ project }).lean();
    const allDates = await ProjectDates.findOne(
      { projectName: project }
    ).lean();

    if (!allDates) { // this can be null
      return res.status(400).send(`Dates for project "${project}" not found.`);
    }

    let dateArray;
    switch (datesort) {
      case 'desc' || undefined:
        dateArray = allDates.dates.reverse();
        break;
      case 'asc':
        dateArray = allDates.dates;
        break;
      default:
        dateArray = allDates.dates.reverse();
        break;
    }

    return res.status(200).send({ 
      itls: allItl, 
      itlDates: dateArray
    });
  } catch (e) {
    console.log(e)
    return res.status(500).send(e);
  }
};

module.exports = itlGetAll;
