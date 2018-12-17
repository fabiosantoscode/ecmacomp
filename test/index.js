const assert = require('assert').strict || require('assert')
const jscomp = require('..')
const parser = require('../lib/parser')

describe('jscomp', () => {
  /*it('compiles Javascript to bytecode', () => {
    assert.deepEqual(jscomp(`
      function foo() {
        bar(4)
      }
      foo()
      const x = 6
    `), [
      ['function', ['name', 'foo']],
      ['push', 4],
      ['push', ['name', 'bar']],
      ['call', 1],
      ['end'],
      ['push', ['name', 'foo']],
      ['call', 0],
      ['push', 6],
      ['const', 'x'],
      ['end']
    ])
  })*/
  it('compiles javascript to bytecode', () => {
    assert.deepEqual(jscomp.stringify([
      ['function', ['name', 'foo']],
      ['push', 4],
      ['push', ['name', 'bar']],
      ['call', 1],
      ['end'],
      ['push', ['name', 'foo']],
      ['call', 0],
      ['push', 6],
      ['const', 'x'],
      ['end']
    ]), 'function foo(){bar(4);}foo();const x=6;')
  })
})
