/**
 * @name routePrefix
 * @description Returns a prefixed route string. 
 * @param {String} route - Required. Route to prefix.
 * @param {Number} version - Default 0.
 * @returns {String} Prefixed route string.
 */
const routePrefix = (route /* route path string */, version = 0) => {
  if (!route)
    return Error('Route string required.');
  if (typeof route !== 'string')
    return Error('Route must be a String.');
  if (typeof version !== 'number')
    return Error('Version must be a Number.');

  return `/api/v${version}${route}`;
};

module.exports = routePrefix;
