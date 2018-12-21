'use strict'

const fs = require('fs').promises
const withTempFile = require('with-temp-file')
const Prepack = require('prepack')
const rollup = require('rollup')
const rollupJsx = require('rollup-plugin-buble')

module.exports = async (code, { dest, norollup, noprepack }) => {
  return withTempFile(async (file, filename) => {
    if (!code.filename) {
      file.write(code)
      file.end()
      code = { filename }
    }
    const result = norollup ? await fs.readFile(code.filename, 'utf-8') : await (await (await rollup.rollup({
      input: code.filename,
      plugins: [
        rollupJsx({ factory: 'React.createElement' })
      ],
      sourceMap: true
    })).generate({
      format: 'umd'
    })).code
    const prepacked = noprepack ? result : Prepack.prepackSources([{fileContents: result}]).code
    return prepacked
  })
}

module.exports.stringify = require('./stringify')
