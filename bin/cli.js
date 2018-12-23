var argv = require('minimist')(process.argv.slice(2))

const serve = (files) => {
  require('../lib/server')(files)
}

const CLI = () => {
  let files
  if (!argv['_'] || argv['_'].length <= 0) {
    process.stdin.on('data', file => {
      files.append(toString(file))
    })
  } else {
    files = argv['_']
  }
  if (argv.serve) {
    serve(files)
  } else {
    console.error("Uknown parameter")
    return
  }
}

CLI()
