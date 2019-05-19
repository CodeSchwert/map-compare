const argv = require('minimist')(process.argv.slice(2));
const { execSync, execFileSync } = require('child_process');
const fs = require('fs');

/**
 * @description Simple wrapper for gdalinfo. 
 *  Outputs to JSON format for Node.js usage.
 * @param source {String} - Required. TIF file to query.
 * @param outputLoc {String=} 
 *  - Optional. Save gdalinfo output JSON file to this (absolute path) location.
 * @param force {Boolean=} 
 *  - Optional. "-f" shorthand. Force script to overwrite output JSON.
 * @param verbose {Boolean=}
 *  - Optional. "-v" shorthand. Log to console JSON output.
 * @returns {Object} { gdalinfo_output... }
 */
const gdalinfo = async (source, outputLoc, force, verbose) => {
  try {    
    /**
     * get correct system path to gdalinfo
     */
    const gdalinfoBuffer = execSync('which gdalinfo');
    const gdalinfo = gdalinfoBuffer.toString('utf8').trim();

    /**
     * call gdalinfo and output in JSON format
     */
    if (fs.existsSync(source)) {
      const gdalinfoDataBuffer = execFileSync(gdalinfo, [source, '-json']);
      const gdalinfoData = gdalinfoDataBuffer.toString('utf8').trim();

      /**
       * if outputLoc parameter is present, attempt write to file
       */
      if (Boolean(outputLoc)) {
        if (!fs.existsSync(outputLoc)) {
          fs.writeFileSync(outputLoc, gdalinfoData);
        } else if (fs.existsSync(outputLoc) && force) {
          fs.writeFileSync(outputLoc, gdalinfoData);
        } else if (fs.existsSync(outputLoc) && !force) {
          throw Error(`file already exists, not overwriting ${outputLoc}`);
        } else {
          throw Error(
            `something went wrong, failed to write to file ${outputLoc}`);
        }
      }

      if (verbose) {
        console.log(gdalinfoData);
      }

      return gdalinfoData;

    } else {
      throw Error(`Source file does not exist: ${source}`);
    }
  } catch (e) {
    console.log(e);
  }
};

/**
 * check if called from the console, if so, call the 
 * gdalinfo wrapper passing the command line arguments
 */
if (require.main === module) {
  const { source, outputLoc, force, f, verbose, v } = argv;

  const forceOpt = Boolean(f)||Boolean(force)
  const verboseOpt = Boolean(verbose)||Boolean(v);

  gdalinfo(source, outputLoc, forceOpt, verboseOpt);
}

module.exports = gdalinfo;
