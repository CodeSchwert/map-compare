const mongoose = require('mongoose');
const ProjectDates = mongoose.model('projectDates');

/**
 * @name date_getAll
 * @description Get all dates for a project
 * @path {GET} routePrefix + /dates
 * @query {String} project - Required. Get all ITL from this project
 * @code {200} Query completed successfully
 * @code {500} Server error
 * @response {String[]}
 */
const dateGetAll = async (req, res) => {
  try {
    if (!req.query.project || req.query.project.length == 0) {
      return res.status(400).send('Query parameter "project" empty or missing.');
    }

    const { project } = req.query;
    const allDates = await ProjectDates.findOne({ projectName: project });

    if (!allDates) { // this can be null
      return res.status(400).send(`Dates for project "${project}" not found.`);
    }

    return res.status(200).send(allDates.dates);
  } catch (e) {
    return res.status(500).send(e);
  }
};

module.exports = dateGetAll;
