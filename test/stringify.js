'use strict'

const assert = require('assert').strict || require('assert')
const ecmacomp = require('..')

describe('stringify', () => {
  it('can read a function call', () => {
    assert.equal(
      ecmacomp.stringify([
        ['push', ['name', 'fn']],
        ['push', 3],
        ['push', ['name', 'i']],
        ['call', 3]
      ]),
      'fn(3,i)'
    )
  })
  it('can use spread', () => {
    assert.equal(
      ecmacomp.stringify([
        ['push', ['name', 'foo']],
        ['push', ['name', 'a'], { spread: 1 }],
        ['push', [0]],
        ['call', 3]
      ]),
      'foo([...a])'
    )
  })
  it('can read a function', () => {
    assert.equal(
      ecmacomp.stringify([
        ['fn', 'foo', ['name', 'a', { spread: 1 }]],
        ['push', 3],
        ['ret'],
        ['end']
      ]),
      'function foo(...a){return 3}'
    )
    assert.equal(
      ecmacomp.stringify([
        ['fn', 'foo', ['name', 'a', { def: [['push', 4]] }], ['array'], ['name', 'b'], ['name', 'c', { spread: 1 }], ['end'], ['object'], ['name', 'foo', { def: [['push', 'bar']] }], ['end']],
        ['push', 3],
        ['ret'],
        ['end']
      ]),
      'function foo(a=4,[b,...c],{foo="bar"}){return 3}'
    )
  })
  it('compiles bytecode to Javascript', () => {
    assert.deepEqual(ecmacomp.stringify([
      ['fn', 'foo'],
      ['push', ['name', ':decr']],
      ['push', ['name', 'i']],
      ['call', 2],
      ['push', ['name', ':decrby']],
      ['push', ['name', 'i']],
      ['push', 1],
      ['call', 3],
      ['push', ['name', 'bar']],
      ['push', 4],
      ['fn', '=>'],
      ['push', 3],
      ['ret'],
      ['end'],
      ['push', 'bar'],
      ['push', { foo: 0 }],
      ['call', 4],
      ['end'],
      ['push', ['name', 'foo']],
      ['call', 1],
      ['push', 6],
      ['var', 'const', 'x', true]
    ]), 'function foo(){i--;i-=1;bar(4,()=>{return 3},{"foo":"bar"})};foo();const x=6')
  })
  it('can beautify the code if asked to')
})
