'use strict'

const fs = require('fs').promises
const withTempFile = require('with-temp-file')
const Prepack = require('prepack')
const Terser = require('terser')
const rollup = require('rollup')
const rollupJsx = require('rollup-plugin-buble')
const rollupNodeResolve = require('rollup-plugin-node-resolve')
const parse = require('./parse')
const stringify = require('./stringify')

module.exports = async (code, { noRollup, noPrepack, debug } = {}) => {
  return withTempFile(async function (file, filename) {
    if (!code.filename) {
      file.write(code)
      file.end()
      code = { filename }
    }
    const result = noRollup ? await fs.readFile(code.filename, 'utf-8') : await (await (await rollup.rollup({
      input: code.filename,
      plugins: [
        rollupJsx({ factory: 'React.createElement' }),
        rollupNodeResolve({})
      ],
      output: {
        sourcemap: true
      }
    })).generate({
      format: 'umd'
    })).code
    const prepacked = noPrepack ? result : Prepack.prepackSources([{ fileContents: result }]).code
    const uglified = process.env.NODE_ENV === 'production'
      ? Terser.minify(prepacked, {
        compress: {
          unsafe: true,
          join_vars: false,
          loops: false,
          module: true,
          switches: false,
          unsafe_arrows: true
        }
      }).code
      : prepacked
    return uglified
    /*
    const bytecode = parse(uglified, { debug })
    return stringify(bytecode, { debug })
    */
  })
}

Object.assign(module.exports, { parse, stringify })
