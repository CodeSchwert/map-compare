const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Note on the different dates:
 * "date" - used to store the date string from the filename
 * "jsDate" - JS date object from the "date" string
 * "luxonDate" - Luxon date object from the "date" string
 */
const ITL = new Schema({
  project: String,
  number: Number,
  dates: [ String ],
  rawImages: { 
    type: Map, 
    of: {
      filename: String,
      location: String,
      relativeLocation: String,
      date: String, 
      jsDate: Date,
      luxonDate: Schema.Types.Mixed,
      gdalinfo: Schema.Types.Mixed
    }
  },
  redDifImages: {
    type: Map, 
    of: {
      filename: String,
      location: String,
      relativeLocation: String,
      date1: String,
      date2: String,
      jsDate1: Date,
      jsDate2: Date,
      luxonTime1: Schema.Types.Mixed,
      luxonTime2: Schema.Types.Mixed,
      gdalinfo: Schema.Types.Mixed
    }    
  },
  warpImages: {
    type: Map, 
    of: {
      filename: String,
      location: String,
      relativeLocation: String,
      date: String, 
      jsDate: Date,
      luxonDate: Schema.Types.Mixed,
      gdalinfo: Schema.Types.Mixed
    }
  },
  latest: String // record the last inserted date string
}, { timestamps: true });

mongoose.model('ITL', ITL);
module.exports = ITL;
