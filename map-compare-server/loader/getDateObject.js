const { DateTime } = require('luxon');

/**
 * @name getDateObject
 * @description Convert a delta file date string to JS and Luxon date objects
 * @param {String} dateString
 * @returns {Object} { jsDate: String, luxonDate: Object } || null
 */
const getDateObject = (dateString) => {
  if (dateString.match(/^[0-9]{8}$/) == null) 
    return null;

  if (dateString.length != 8) 
    return null;

  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  const date = DateTime.utc(Number(year), Number(month), Number(day));

  return { 
    jsDate: date.toJSDate(),
    luxonDate: date
  };
};

module.exports = getDateObject;
