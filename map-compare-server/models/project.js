const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Project = new Schema(
  {
    name: String,
    folderPath: String
  }, 
  { timestamps: true }
);

mongoose.model('project', Project);
module.exports = Project;
