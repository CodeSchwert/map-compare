const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('../models');
const ITL = mongoose.model('ITL');

const getDateObject = require('./getDateObject');
const getImageDates = require('./getImageDates');
const getITL = require('./getITL');
const isImageType = require('./isImageType');

/**
 * @name procImageDir
 * @description Process directory of images; add images to database.
 * @param {String} folderPath - Required.
 * @param {String} imageType - Required. accepts values 'raw', 'red-dif', 'warp'.
 * @param {String} project - Required. name of the project (folder).
 * @param {String} relativeURL - Required. relative path of dir within delta data directory.
 * @returns {Object} { imageType: String, imagesProccessed: Number, imagesAdded: Number }
 */
const procImageDir = async (folderPath, imageType, project, relativeURL) => {
  if (!folderPath || !imageType)
    return Error("'folderPath' and 'ImageType' parameters required.");
  if (!fs.existsSync(folderPath))
    return Error(`'folderPath' ${folderPath} not found`);
  if (!['raw', 'red-dif', 'warp'].includes(imageType))
    return Error(`Invalid 'imageType' ${imageType}`);
  if (!relativeURL)
    return Error("'relativeURL' parameter required.");

  console.log(`\n\tProcessing Image Directory: ${folderPath}\n`);

  let imagesProccessed = 0;
  let imagesAdded = 0;

  const imageDirContents = fs.readdirSync(folderPath, { withFileTypes: true });

  for (const imageDirItem of imageDirContents) {
    const fileImageName = imageDirItem.name;
    const fileImagePath = path.resolve(folderPath, fileImageName);
    // const imageType = isImageType(imageDirItem.name);
    const relativeFileUrl = `${relativeURL}/${fileImageName}`;

    if (imageDirItem.isFile() && (isImageType(fileImageName) == imageType)) {
      const fileITL = getITL(fileImageName);
      const imageDates = getImageDates(fileImageName, imageType);
      const updateDoc = {};
      // const updateDoc = new ITL();

      let imageContainer;
      switch (imageType) {
        case 'raw':
          imageContainer = 'rawImages';
          break;
        case 'red-dif':
          imageContainer = 'redDifImages'
          break;
        case 'warp':
          imageContainer = 'warpImages'
          break;
      }

      /**
       * check for gdalinfo JSON metadata file
       */
      let metadata;
      const imageFilename = path.parse(fileImagePath).name;
      const jsonFilename = path.resolve(folderPath, `${imageFilename}.json`)
      if (fs.existsSync(jsonFilename)) {
        metadata = require(jsonFilename);
      }

      // check image isn't already in the database
      const res = await ITL.findOne({ project: project, number: fileITL }).lean();

      if (!res) { // new ITL, setup ITL project and number
        updateDoc.project = project;
        updateDoc.number = fileITL;
      }

      if (imageType == 'raw' || imageType == 'warp') {
        const dateObject = getDateObject(imageDates.date);
        const imageDoc = {
          filename: fileImageName,
          location: fileImagePath,
          relativeLocation: relativeFileUrl,
          date: imageDates.date,
          jsDate: dateObject.jsDate,
          luxonDate: dateObject.luxonDate,
          gdalinfo: metadata
        };

        updateDoc['$addToSet'] = { dates: imageDates.date };

        if (!res) {
          // set the imageContainer map and first sub document
          updateDoc[imageContainer] = { [imageDates.date]: imageDoc };
        } else {
          // add new document to existing image container document
          updateDoc[imageContainer] = res[imageContainer] || {};
          updateDoc[imageContainer][imageDates.date] = imageDoc;
        }
      }

      if (imageType == 'red-dif') {
        const dateObject1 = getDateObject(imageDates.date1);
        const dateObject2 = getDateObject(imageDates.date2);
        const imageDoc = { 
          filename: fileImageName,
          location: fileImagePath,
          relativeLocation: relativeFileUrl,
          date1: imageDates.date1,
          date2: imageDates.date2,
          jsDate1: dateObject1.jsDate,
          jsDate2: dateObject2.jsDate,
          luxonTime1: dateObject1.luxonDate,
          luxonTime2: dateObject2.luxonDate,
          gdalinfo: metadata
        };

        updateDoc['$addToSet'] = { dates: imageDates.date1 };
        
        if (!res) {
          // set the imageContainer map and first sub document
          updateDoc[imageContainer] = { [imageDates.date1]: imageDoc }
        } else {
          // add new document to existing image container document
          updateDoc[imageContainer] = res[imageContainer] || {};
          updateDoc[imageContainer][imageDates.date1] = imageDoc;
        }        
      }

      // insert new image into ITL model
      const updateResult = await ITL.updateOne(
        { project, number: fileITL }, 
        updateDoc,
        { upsert: true }
      ).lean();

      if (updateResult && updateResult.ok == 1) {
        console.log(`\tupdated: ${relativeFileUrl}`);
        imagesAdded++;
      }
      
      // increment imagesAdded count
      imagesProccessed++;
    }
  }

  return {
    imageType,
    imagesProccessed,
    imagesAdded
  };
};

module.exports = procImageDir;
