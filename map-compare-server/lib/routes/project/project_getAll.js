const mongoose = require('mongoose');
const project = mongoose.model('project');

/**
 * @name project_getAll
 * @description Get all projects
 * @path {GET} routePrefix + /projects
 * @code {200} Query completed successfully
 * @code {500} Server error
 * @response {Object[]}
 */
const projectGetAll = async (req, res) => {
  try {
    const allProjects = await project.find({});

    return res.status(200).send(allProjects);
  } catch (e) {
    return res.status(500).send(e);
  }
};

module.exports = projectGetAll;
