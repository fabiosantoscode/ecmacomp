'use strict'

const assert = require('assert').strict || require('assert')
const parse = require('../lib/parse')

describe('parse', () => {
  it('parses idents and membexen', () => {
    assert.deepEqual(parse(`
      foo
      foo.bar
      foo[1]
    `), [
      ['push', ['name', 'foo']],
      ['push', ['name', ':membex']],
      ['push', ['name', 'foo']],
      ['push', ['name', 'bar']],
      ['call', 3],
      ['push', ['name', ':subscript']],
      ['push', ['name', 'foo']],
      ['push', 1],
      ['call', 3],
    ])
  })
  it('parses if statement', () => {
    assert.deepEqual(parse(`
      if (foo) {
        bar()
      } else {
        baz()
      }
    `), [
      ['push', ['name', 'foo']],
      ['fn'],
      ['push', ['name', 'bar']],
      ['call', 1],
      ['end'],
      ['fn'],
      ['push', ['name', 'baz']],
      ['call', 1],
      ['end'],
      ['push', ['name', ':if']],
      ['call', 3],
    ])
  })
  it('parses try..catch', () => {
    assert.deepEqual(parse(`
      try {
        foo()
      } catch(e) {
        baz()
      } finally {
        bro()
      }
    `), [
      ['push', ['name', ':try']],
      ['fn'],
      ['push', ['name', 'foo']],
      ['call', 1],
      ['end'],
      ['push', ['name', 'e']],
      ['fn'],
      ['push', ['name', 'baz']],
      ['call', 1],
      ['end'],
      ['fn'],
      ['push', ['name', 'bro']],
      ['call', 1],
      ['end'],
      ['call', 5],
    ])
  })
  it('parses let', () => {
    assert.deepEqual(parse(`
      let x = 3
      let y
    `), [
      ['push', 3],
      ['var', 'let', 'x', true],
      ['var', 'let', 'y']
    ])
  })
  it('parses ternaries', () => {
    assert.deepEqual(parse(`
      x ? 1 : 0
    `), [
      ['push', ['name', ':tern']],
      ['push', ['name', 'x']],
      ['push', 1],
      ['push', 0],
      ['call', 4],
    ])
  })
  it('parses functions', () => {
    assert.deepEqual(parse(`
      ({ a: [...f] }) => f
    `), [
      ['fn', '=>'],
      ['push', ['name', 'f']],
      ['ret'],
      ['end'],
    ])
  })
  it('parses arrow functions with blocks', () => {
    assert.deepEqual(parse(`
      (...x) => {
        return 3
      }
    `), [
      ['fn', '=>'],
      ['push', 3],
      ['ret'],
      ['end'],
    ])
  })
  it('parses case statements', () => {
    assert.deepEqual(parse(`
      switch (something) {
        case 0: 3
      }
    `), [
      ['push', ['name', ':switch']],
      ['push', ['name', 'something']],
      ['fn'],
      ['push', 0],
      ['case'],
      ['push', 3],
      ['end'],
      ['call', 3],
    ])
  })
  it('parses complex case statements', () => {
    assert.deepEqual(parse(`
      switch (something) {
        case 1:
        foo()
        case 2:
        default:
        break;
      }
    `), [
      ['push', ['name', ':switch']],
      ['push', ['name', 'something']],
      ['fn'],
      ['push', 1],
      ['case'],
      ['push', ['name', 'foo']],
      ['call', 1],
      ['push', 2],
      ['case'],
      ['case', { def: 1 }],
      ['break'],
      ['end'],
      ['call', 3],
    ])
  })
  /*
      const otherFn = ({foo: bar}) => {
        foo()
      }
    ])
  })
    ])
  })
      do {
        foo()
      } while(bar)
    ])
  })
      while (baz) {
        foo()
      }
    `), [
    ])
  })
  */
  it('compiles some complex Javascript to bytecode', async () => {
    assert.deepEqual(parse(`
      function foo() {
        bar(4)
      }
      foo()
      const x = 6
    `), [
      ['fn', ['name', 'foo']],
      ['push', ['name', 'bar']],
      ['push', 4],
      ['call', 2],
      ['end'],
      ['push', ['name', 'foo']],
      ['call', 1],
      ['push', 6],
      ['var', 'const', 'x', true],
    ])
  })
})
