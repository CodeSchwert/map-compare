/**
 * @name getImageDates
 * @description extract dates from delta image filenames
 * @param {String} imageName - Required. Delta image filename.
 * @param {String} imageType - Required. Delta image type, must be either 'raw', 'red-dif', or 'warp'
 * @returns {Object} { date: String } | { date1: String, date2: String} | null
 */
const getImageDates = (imageName, imageType) => {
  if (!imageName && !imageType)
    return Error('imageName" and "ImageType"');
  if (!imageName.endsWith('.jpg'))
    return null;
  if (!['raw', 'red-dif', 'warp'].includes(imageType))
    return Error(`Invalid 'imageType' ${imageType}`);

  const patternRaw = /^[0-9]{4}_([0-9]{8})\.jpg$/;
  const patternRedDiff = /^[0-9]{4}_red-dif_([0-9]{8})-([0-9]{8})\.jpg$/;
  const patternWarp = /^[0-9]{4}_warp_([0-9]{8})\.jpg$/;

  let imageDates;
  switch (imageType) {
    case 'raw':
      imageDates = imageName.match(patternRaw);
      break;
    case 'red-dif':
      imageDates = imageName.match(patternRedDiff);
      break;
    case 'warp':
      imageDates = imageName.match(patternWarp);
      break;
  }

  if ((imageType == 'raw'|| imageType == 'warp') && (imageDates[1])) {
    return {
      date: imageDates[1]
    }
  } else if (imageType == 'red-dif' && imageDates[1] && imageDates[2]) {
    return {
      date1: imageDates[1],
      date2: imageDates[2]
    };
  } else {
    return null;
  }
};

module.exports = getImageDates;
