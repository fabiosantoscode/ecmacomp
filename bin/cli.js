#!/usr/bin/env node
'use strict'

const ecmacomp = require('..')
const assert = require('assert')
const argv = require('minimist')(process.argv.slice(2))

const serve = (files) => {
  require('../lib/server')(files)
}

let files = []
if (!argv['_'] || argv['_'].length <= 0) {
  process.stdin.on('data', file => {
    files.append(toString(file))
  })
} else {
  files = argv['_']
}

const usage = `Usage:

Transform a file:

    $ ecmacomp <file> [--norollup] [--noprepack] [--public dir] [--output file]


Run development server:

    $ ecmacomp --serve [--norollup] [--noprepack] [--public dir]
`
if (argv.serve) {
  assert(!argv.output, 'Output file is not used in server')
  serve(files)
} else if (argv.help) {
  console.log(usage)
} else if (argv._[0]) {
  ecmacomp({ filename: argv._[0] }).then(res => {
    console.log(res)
  }, e => {
    console.error(e)
    process.exit(1)
  })
} else {
  console.error("Uknown command")
  console.log(usage)
  return
}
