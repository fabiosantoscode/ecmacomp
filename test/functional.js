'use strict'

const assert = require('assert')
const ecmacomp = require('..')

describe('functional tests', () => {
  // I recommend you solve it. If you can do it, you're a good programmer
  // http://lisperator.net/blog/a-little-javascript-problem/
  it.skip('goes through ecmacomp and still works', async () => {
    console.log(ecmacomp.parse(require('fs').readFileSync(__dirname + '/examples/lisperator-problem-extended-25-11-2016.js') + ''))
    const code = await ecmacomp(
      { filename: __dirname + '/examples/lisperator-problem-extended-25-11-2016.js' },
      { noPrepack: true, noRollup: true } // TODO find out how to remove these and have the test still pass. @hallowf?
    )
    const test = []
    console.log(code)
    eval(code.replace('console.log', 'test.push'))
    assert.deepEqual(test, [
      100,
      81,
      64,
      49,
      36,
      25,
      16,
      9,
      4,
      1
    ])
  })
  it.skip('compiles terser, and it can compile things', async () => {
    const code = await ecmacomp(
      { filename: __dirname + '/examples/terser.js' },
      { noRollup: true, noPrepack: true }
    )
    const Object = global.Object
    eval(code)
  })
  it('compiled terser can compile itself, and compile things')
})
