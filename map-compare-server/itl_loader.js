require('dotenv').config('.env');
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('./models');
const project = mongoose.model('project');
const projectDatesModel = mongoose.model('projectDates');
const { isDateFolder, procImageDir } = require('./loader');

/**
 * Constants
 */
const { DELTA_DATA_FOLDER, MONGO_URI } = process.env;
const DELTA_DATA = path.resolve(DELTA_DATA_FOLDER);
const IGNORE_PROJECTS = ['osd-icons'];

/**
 * Mongoose Configuration
 */
mongoose.Promise = global.Promise;
const connectOpts = {
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 1000,
  keepAlive: 1,
  useNewUrlParser: true
};
mongoose.connection
  .once('open', () => { 
    console.log('\nConnected to MongoDB instance:', MONGO_URI, '\n')
  })
  .on('error', error => { 
    console.log('\nError connecting to MongoDB:', error, '\n')
  })
  .on('close', () => { 
    console.log('\nMongoDB connection closed', '\n')
  });

/**
 * Main Block
 */
(async () => {
  try {
    // sync connection to mongodb
    await mongoose.connect(MONGO_URI, connectOpts);

    if (!fs.existsSync(DELTA_DATA)) {
      console.error(DELTA_DATA, 'directory not found!');
      process.exit(1);
    }
  
    const fsReadOpts = { withFileTypes: true };
    const delta_projects = [];
    const projectFiles = fs.readdirSync(DELTA_DATA, fsReadOpts);

    for (const projectFile of projectFiles) {
      if (projectFile.isDirectory()) {
        if (!IGNORE_PROJECTS.includes(projectFile.name)) {
          
          const projectPath = path.resolve(DELTA_DATA, projectFile.name);
          if (fs.existsSync(projectPath)) {
            delta_projects.push({ projectName: projectFile.name, projectPath });
          }
        }
      }
    }
    // save projects into database
    for (const delta_project of delta_projects) {
      const { projectName, projectPath } = delta_project;

      console.log(`\tUpdate project: ${projectName}: ${projectPath}`);

      const updatedProject = await project.updateOne(
        { name: projectName }, 
        { name: projectName, folderPath: projectPath}, 
        { upsert: true }
      );

      if (!Boolean(updatedProject.ok)) {
        throw new Error('Error updating project', projectName);
      }
    }

    // process project folders
    for (const project of delta_projects) {
      const { projectName, projectPath } = project;
      console.log(`\n\tProcessing Project "${projectName}"`);
      
      // list date folders
      const projectDates = fs.readdirSync(projectPath, fsReadOpts);

      // process each date folder
      for (const dateFolder of projectDates) {
        if (dateFolder.isDirectory() && isDateFolder(dateFolder.name)) {

          const pushDate = await projectDatesModel.updateOne(
            { projectName }, 
            { projectName, '$addToSet': { dates: dateFolder.name } },
            { upsert: true }
          );
          if (!Boolean(pushDate.ok)) {
            throw new Error('Error updating project date', dateFolder.name);
          }

          const dateFolderPath = path.resolve(projectPath, dateFolder.name);
          const dateFolderContents = fs.readdirSync(dateFolderPath, fsReadOpts);

          for (const dateFolderContent of dateFolderContents) {
            if (dateFolderContent.isDirectory()) {
              const imageDir = path.resolve(dateFolderPath, dateFolderContent.name);
              console.log();

              const relativeURL = `/${projectName}/${dateFolder.name}/${dateFolderContent.name}`

              let procResult;
              switch (dateFolderContent.name) {
                case 'raw':
                  procResult = await procImageDir(imageDir, 'raw', projectName, relativeURL);
                  break;
                case 'redDiff':
                  procResult = await procImageDir(imageDir, 'red-dif', projectName, relativeURL);
                  break;
                case 'warp':
                  procResult = await procImageDir(imageDir, 'warp', projectName, relativeURL);
                  break;                                
                default:
                  // do nothing
                  break;
              }
              console.log('\n\t', procResult);
            }
          }
        }
      }
    }

    /**
     * Close script
     */
    await mongoose.connection.close(err => {
      if (err) {
        console.error(err);
        process.exit(1);
      };
      console.log('The End');
      process.exit(0);
    });
  
  } catch (e) {
    console.log('Main block error:', '\n');
    console.error(e);
    process.exit(1);
  }
})();
