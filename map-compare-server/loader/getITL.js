/**
 * @name getITL
 * @description Get ITL number from TIFF image filename
 * @param {String} imageName
 * @returns Number || null
 */
const getITL = (imageName) => {
  if (!imageName.endsWith('.jpg'))
    return null;
  
  // match first 4 numbers only from image filename
  // files with more ore less than 4 digits before the underscore will fail
  const itlNumber = imageName.match(/^([0-9]{4})_.+$/);
  if (itlNumber) {
    return Number(itlNumber[1]);
  } else {
    return null
  }
};

module.exports = getITL;
