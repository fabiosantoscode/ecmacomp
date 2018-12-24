'use strict'

const assert = require('assert').strict || require('assert')
const ecmacomp = require('..')

describe('parse', () => {
  it.skip('compiles Javascript to bytecode', async () => {
    assert.deepEqual(await ecmacomp(`
      function foo() {
        bar(4)
      }
      foo()
      const x = 6
    `), [
      ['fn', ['name', 'foo']],
      ['push', 4],
      ['push', ['name', 'bar']],
      ['call', 1],
      ['end'],
      ['push', ['name', 'foo']],
      ['call', 0],
      ['push', 6],
      ['var', 'const', 'x'],
      ['end']
    ])
  })
  it.skip('compiles more javascript to bytecode', async () => {
    assert.deepEqual(await ecmacomp(`
      if (foo) {
        bar()
      } else {
        baz()
      }
      try {
        foo()
      } catch(e) {
        baz()
      } finally {
        bro()
      }
      let x = 3 ? 1 : 6
      var fn = ({ a: [...f] }) => f
      const otherFn = ({foo: bar}) => {
        foo()
      }
      switch (something) {
        case 0:
        default:
          break;
      }
      do {
        foo()
      } while(bar)
      while (baz) {
        foo()
      }
    `), [
      ['fn'],
      ['push', ['name', 'foo']],
      ['push', ['name', 'bar']],
      ['call', 0],
      ['end'],
      ['fn'],
      ['push', ['name', 'baz']],
      ['call', 0],
      ['end'],
      ['push', ['name', ':if']],
      ['call', 9],
      ['fn'],
      ['push', ['name', 'foo']],
      ['call', 0],
      ['end'],
      ['push', ['name', 'e']],
      ['fn'],
      ['push', ['name', 'baz']],
      ['call', 0],
      ['end'],
      ['fn'],
      ['push', ['name', 'bro']],
      ['call', 0],
      ['end'],
      ['push', ['name', ':try']],
      ['call', 13],
      ['fn'],
      ['push', 3],
      ['end'],
      ['fn'],
      ['push', 1],
      ['end'],
      ['fn'],
      ['push', 6],
      ['end'],
      ['push', ['name', ':tern']],
      ['call', 9],
      ['var', 'let', 'x']
    ])
  })
})
