const fs = require( "fs-extra" ),
      { spawn } = require( "child_process" );
/**
  * Remove trailing slash
  * @param {string} dir
  * @returns {string}
  */
function rtrim( dir )
{
  return dir.replace( /\/$/, "" );
}
/**
 * Remove a directory with content
 * @param {string} dir
 */
async function remove( dir ){
  fs.removeSync( dir );
}

/**
 * Copy dir
 * @param {string} from
 * @param {string} to
 * @param {FileDescriptor} log
 * @returns {Promise}
 */
async function copy( from, to, log ){
  return new Promise(( resolve, reject ) => {
    fs.writeSync( log, `copy "${from}" "${to}"\n`, "utf-8" );
    fs.copy( from, to, ( err ) => {
      if ( err ) {
        fs.writeSync( log, `ERROR: ${err}\n`, "utf-8" );
        return reject( err );
      }
      resolve();
    });
  });
}

/**
 * Launch detached process
 * @param {string} runnerPath
 * @param {string[]} argv
 * @param {string} cwd
 * @param {string} logPath
 * @returns {Promise}
 */
async function launch( runnerPath, argv, cwd, logPath ){
   return new Promise(( resolve, reject ) => {
      const log = fs.openSync( logPath, "a" ),

      child = spawn( runnerPath, argv, {
         detached: true,
         stdio: [ 'ignore', log, log ],
         cwd
       });

      child.stdout.on( "data", ( data ) => {
         fs.writeSync( log, `${data}`, "utf-8" );
      });

      child.stderr.on( "data", ( data ) => {
        fs.writeSync( log, `DATA: ${data}`, "utf-8" );
      });

      child.on( "error", ( e ) => {
        fs.writeSync( log, [ "ERROR:", e, "\r\n" ].join( " " ), "utf-8" );
        reject( e );
      });

      child.on( "close", ( c ) => {
        fs.writeSync( log, `CLOSED: ${c}`, "utf-8" );
      });

      child.unref();
      setTimeout( resolve, 50 );
   });
}

exports.launch = launch;
exports.rtrim = rtrim;
exports.copy = copy;
exports.remove = remove;
