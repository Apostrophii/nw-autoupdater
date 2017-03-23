const { join, dirname } = require( "path" ),
      fs = require( "fs-extra" ),
      os = require( "os" ),
      { spawn } = require( "child_process" ),
      LOG_PATH = join( nw.App.dataPath, "swap.log" );


/**
 * Copy dir
 * @param {string} from
 * @param {string} to
 * @returns {Promise}
 */
async function copy( from, to ){
  return Promise(( resolve, reject ) => {
    fs.copy( from, to, ( err ) => {
      if ( err ) {
        return reject( err );
      }
      resolve();
    });
  });
}

/**
 * Swap update and original directories
 * @param {string} origHomeDir
 * @param {string} selfDir
 * @param {string} backupPath
 * @returns {Promise}
 */
async function swap( origHomeDir, selfDir, backupPath ){
  await copy( origHomeDir, backupPath );
  await copy( selfDir, origHomeDir );
}
/**
 * Launch detached process
 * @param {string} runnerPath
 * @param {string[]} argv
 * @param {string} cwd
 * @returns {Promise}
 */
async function launch( runnerPath, argv, cwd ){
   return new Promise(( resolve, reject ) => {
      const err = fs.openSync( LOG_PATH, "a" ),

      child = spawn( runnerPath, argv, {
         timeout: 4000,
         detached: true,
         cwd
       });

       child.on( "error", ( e ) => {
         fs.writeSync( err, [ "ERROR:", e, "\r\n" ].join( " " ), "utf-8" );
         reject( err );
       });

       child.unref();

       setTimeout( resolve, 500 );
   });
}

exports.launch = launch;
exports.swap = swap;