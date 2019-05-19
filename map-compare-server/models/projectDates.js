const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectDates = new Schema(
  {
    projectName: String,
    dates: [ String ]
  }, 
  { timestamps: true }
);

mongoose.model('projectDates', ProjectDates);
module.exports = ProjectDates;
