const { DateTime } = require('luxon');

/**
 * @name isDateFolder
 * @description Async function. Check the date folder name is a valid date.
 * @param {String} dateString - Required. Delta date folder name.
 * @returns {Boolean} true || false
 */
const isDateFolder = async (dateString) => {
  if (dateString.match(/^[0-9]+$/) == null) 
    return false;

  if (dateString.length != 8) 
    return false;

  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  const date = DateTime.fromObject({ 
    year: Number(year), 
    month: Number(month), 
    day: Number(day) 
  }, { zone: 'utc' });
  
  if (date.isValid) 
    return true;
  else
    return false;
};

module.exports = isDateFolder;
