require('dotenv').config('.env');
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const { isDateFolder, procImageDir } = require('./loader');
const { gdalinfo } = require('./gdal');

/**
 * Constants
 */
const { DELTA_DATA_FOLDER } = process.env;
const DELTA_DATA = path.resolve(DELTA_DATA_FOLDER);

/**
 * @name parseImageDir
 * @param {String} directory 
 */
const parseImageDir = async (directory) => {
  try {
    /**
     * 1. check for "tif" subdirectory
     */
    const tifDirectory = path.resolve(directory, 'tif');

    if (fs.existsSync(tifDirectory)) {
      /**
       * 2. get tif directory contents
       */
      console.log(`\n\t\tParsing TIF directory: ${tifDirectory}\n`);
      const tifFiles = fs.readdirSync(tifDirectory, { withFileTypes: true });
      
      /**
       * 3. iterate over tifs and run gdal info script
       */
      for (const tif of tifFiles) {
        if (tif.isFile() && tif.name.endsWith('.tif')) {
          // currently processing ...
          console.log(`\t\t${tif.name}`);

          const tifFilename = path.parse(tif.name).name;
          const jsonFilename = path.resolve(directory, `${tifFilename}.json`);
          const tifAbsPath = path.resolve(tifDirectory, tif.name);

          gdalinfo(tifAbsPath, jsonFilename, true);
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * Main Block
 */
(async () => {
  try {
    if (!fs.existsSync(DELTA_DATA)) {
      console.error(DELTA_DATA, 'directory not found!');
      process.exit(1);
    }
  
    const fsReadOpts = { withFileTypes: true };
    const delta_projects = [];
    const projectFiles = fs.readdirSync(DELTA_DATA, fsReadOpts);

    /**
     * compile list of project folders in DeltaData directory
     */
    for (const projectFile of projectFiles) {
      if (projectFile.isDirectory()) {
        const projectPath = path.resolve(DELTA_DATA, projectFile.name);
        if (fs.existsSync(projectPath)) {
          delta_projects.push({ projectName: projectFile.name, projectPath });
        }
      }
    }

    /**
     * Generate GDAL info output JSON files
     */
    for (const project of delta_projects) {
      const { projectName, projectPath } = project;
      console.log(`\nParsing Project "${projectName}"`);
      
      // list date folders
      const projectDates = fs.readdirSync(projectPath, fsReadOpts);

      // process each date folder
      for (const dateFolder of projectDates) {
        if (dateFolder.isDirectory() && isDateFolder(dateFolder.name)) {

          console.log(`\n\tParsing Project Date "${dateFolder.name}"`);
          const dateFolderPath = path.resolve(projectPath, dateFolder.name);
          const dateFolderContents = fs.readdirSync(dateFolderPath, fsReadOpts);

          for (const dateFolderContent of dateFolderContents) {
            if (dateFolderContent.isDirectory()) {
              const imageDir = path.resolve(dateFolderPath, dateFolderContent.name);

              parseImageDir(imageDir);
              // console.log();

              // const relativeURL = `/${projectName}/${dateFolder.name}/${dateFolderContent.name}`

              // let procResult;
              // switch (dateFolderContent.name) {
              //   case 'raw':
              //     procResult = await procImageDir(imageDir, 'raw', projectName, relativeURL);
              //     break;
              //   case 'redDif':
              //     procResult = await procImageDir(imageDir, 'red-dif', projectName, relativeURL);
              //     break;
              //   case 'warp':
              //     procResult = await procImageDir(imageDir, 'warp', projectName, relativeURL);
              //     break;                                
              //   default:
              //     // do nothing
              //     break;
              // }
              // console.log('\n\t', procResult);
            }
          }
        }
      }
    }

    /**
     * Close script
     */
    console.log('The End');
    process.exit(0);
  
  } catch (e) {
    console.log('Main block error:', '\n');
    console.error(e);
    process.exit(1);
  }
})();
