'use strict'

const assert = require('assert').strict || require('assert')
const ecmacomp = require('..')
const parallelWorker = require('parallel-worker')

describe('ecmacomp', () => {
  it('reads modules', async () => {
    const result = await ecmacomp({ filename: 'test/examples/rollup-jsx/index.js' })
    const w = parallelWorker.async('()=>{' + result + '}')

    assert.equal(await new Promise(resolve => {
      w.on('stdout', d => {
        resolve(d)
      })
    }), 'null\n')
  })
  it('optimizes code', async () => {
    const res = await ecmacomp({ filename: 'test/examples/opt/index.js' })
    assert.equal(res, 'console.log(2);')
  })

})
