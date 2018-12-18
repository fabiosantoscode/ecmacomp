'use strict'

const assert = require('assert').strict || require('assert')
const jscomp = require('..')

describe('jscomp', () => {
  it('compiles Javascript to bytecode', () => {
    assert.deepEqual(jscomp(`
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
  it('compiles more javascript to bytecode', () => {
    assert.deepEqual(jscomp(`
      if (foo) {
        bar()
      } else {
        baz()
      }
      try {
        foo()
      } catch(e) {
        baz()
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
      ['push', ['name', 'baz']],
      ['call', 0],
      ['end'],
      ['fn'],
      ['push', ['name', 'bar']],
      ['call', 0],
      ['end'],
      ['push', ['name', 'foo']],
      ['push', ['name', ':if']],
      ['call', 9],
      ['fn'],
      ['push', ['name', 'baz']],
      ['call', 0],
      ['end'],
      ['fn'],
      ['push', ['name', 'foo']],
      ['call', 0],
      ['end'],
      ['push', ['name', 'e']],
      ['push', ['name', ':try']],
      ['call', 9],
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
  it('compiles bytecode to Javascript', () => {
    assert.deepEqual(jscomp.stringify([
      ['fn', ['name', 'foo']],
      ['push', 4],
      ['fn', '=>'],
      ['ret', 3],
      ['end'],
      ['push', 'bar'],
      ['push', { foo: 1 }],
      ['push', ['name', 'bar']],
      ['call', 6],
      ['end'],
      ['push', ['name', 'foo']],
      ['call', 0],
      ['push', 6],
      ['var', 'const', 'x'],
      ['end']
    ]), 'fn foo(){bar(4,()=>{return 3},{foo:"bar"});}foo();const x=6;')
  })
})
