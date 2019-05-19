/**
 * @name isImageType
 * @description Determine image type from filename.
 * @param {String} imageName - Required. Must end with '.jpg' extension.
 * @returns 'raw' || 'red-dif' || 'warp' || null
 */
const isImageType = (imageName) => {
  if (!imageName.endsWith('.jpg'))
    return null;

  const pattern = /^[0-9]{4}_([0-9]{8}|red-dif|warp).+$/
  const imageType = imageName.match(pattern);

  if (imageType) {
    if (imageType[1].match(/^[0-9]{8}$/))
      return 'raw';
    else
      return imageType[1];
  } else {
    return null;
  }
};

module.exports = isImageType;
