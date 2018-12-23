var argv = require('minimist')(process.argv.slice(2))

const serve = () => {
  let files
  files = argv["_"]
  require('../lib/server')(files)
}

const CLI = () => {
  let args, arg, files
  args = []
  files = []
  for (arg in argv) { if (arg !== "_") { args.push(arg.toLowerCase()) } }

  if (argv["_"].length() <= 0) {
    process.stdin.pipe(require('split')()).on('data', file => {
      files.append(file)
    })
  }

  
  console.log("Arguments:",args)
  if (args[0] === 'serve') {
    serve()
  } else {
    console.error("Uknown parameter:", args[0])
  }
}

CLI()
