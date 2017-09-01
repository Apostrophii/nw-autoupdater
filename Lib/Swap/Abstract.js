const { join  } = require( "path" ),
      fs = require( "fs" );

class SwapAbstract {

  constructor( options ){
    this.options = options;
  }

  getScriptContent(){
    const { swapScript } = this.options;
    return `#!/bin/bash
for i in "$@"
do
case $i in
  --app-path=*)
    APP_PATH="\${i#*=}"
    shift
    ;;
  --bak-path=*)
    BAK_PATH="\${i#*=}"
    shift
    ;;
  --update-path=*)
    UPDATE_PATH="\${i#*=}"
    shift
    ;;
  --runner=*)
    RUNNER="\${i#*=}"
    shift
    ;;
  --verbose=*)
    VERBOSE="\${i#*=}"
    shift
    ;;
    *)
            # unknown option
    ;;
esac
done
` + ( swapScript ||
`echo "v0.5"
echo 'cp -r \${UPDATE_PATH}/\*/swivel.app \"\${APP_PATH}/\${RUNNER}\";'
cp -r \${UPDATE_PATH}/\*/swivel.app "\${APP_PATH}/\${RUNNER}";
echo "Finished cp"
` );
  }

  extractScript( homeDir )
  {
    const content = this.getSwapScriptContent(),
          scriptPath = join( homeDir, "swap.sh" );
    fs.writeFileSync( scriptPath, content, "utf8" );
    this.scriptPath = scriptPath;
  }

  /**
   * Get args for swap script
   * @returns {Array}
   */
  getArgs()
  {
      const { execDir, updateDir, executable, backupDir, logDir, verbose  } = this.options;
      return [ `--app-path=${execDir}`, `--update-path=${updateDir}`, `--runner=${executable}`,
            `--bak-path=${backupDir}`, `--verbose=${verbose ? `v` : ``}`  ];
  }

  getRunner(){
    return this.scriptPath;
  }

}

module.exports = SwapAbstract;
