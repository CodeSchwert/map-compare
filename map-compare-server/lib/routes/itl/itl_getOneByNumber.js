const mongoose = require('mongoose');
const ITL = mongoose.model('ITL');

/**
 * @name itl_getOneByNumber
 * @description Get a single ITL by project name and ITL number
 * @path {GET} routePrefix + /itl/number
 * @query {String} project - Required. Get all ITL from this project
 * @param {Number} itlNumber - Required. Needs to be a valid Int
 * @code {200} Query completed successfully
 * @code {400} Parameter missing or incorrect
 * @code {500} Server error with MongoDB
 * @response {Object} - A single ITL object
 */
const itlGetOneByNumber = async (req, res) => {
  try {
    if (!req.query.project || req.query.project.length == 0) {
      return res.status(400).send('Query parameter "project" empty or missing.');
    }
    if (!req.params.itlnumber) {
      return res.status(400).send('ITL number parameter missing.');
    }

    const { project } = req.query;
    const { itlnumber } = req.params;
    const itl = await ITL.findOne({ project, number: itlnumber });

    if (itl) {
      return res.status(200).send(itl); 
    } else {
      return res.status(200).send({
        itlnumber,
        project,
        error: `ITL number '${itlnumber}' from project '${project}' not found!`
      });
    }

  } catch (e) {
    if (e.name == 'CastError') { // error during parseInt
      return res.status(400).send('ITL number parameter must be a number.')
    } else {
      return res.status(500).send(e);
    }
  }
};

module.exports = itlGetOneByNumber;
