'use strict'

const assert = require('assert').strict || require('assert')
const jscomp = require('..')

describe('stringify', () => {
  it('can read a function call', () => {
    assert.equal(
      jscomp.stringify([
        ['push', ['name', 'i']],
        ['push', 3],
        ['push', ['name', 'fn']],
        ['call', 2]
      ]),
      'fn(3,i);'
    )
  })
  it('can use spread', () => {
    assert.equal(
      jscomp.stringify([
        ['push', ['name', 'a'], {spread: 1}],
        ['push', [0]],
        ['push', ['name', 'foo']],
        ['call', 2]
      ]),
      'foo([...a]);'
    )
  })
  it('can read a function', () => {
    assert.equal(
      jscomp.stringify([
        ['fn', ['name', 'foo'], ['name', 'a', { spread: 1 }]],
        ['push', 3],
        ['ret'],
        ['end']
      ]),
      'function foo(...a){return 3}'
    )
    assert.equal(
      jscomp.stringify([
        ['fn', ['name', 'foo'], ['name', 'a', { def: [['push', 4]] }], ['array'], ['name', 'b'], ['name', 'c', { spread: 1 }], ['end'], ['object'], ['name', 'foo', { def: [['push', 'bar']] }], ['end']],
        ['push', 3],
        ['ret'],
        ['end']
      ]),
      'function foo(a=4,[b,...c],{foo="bar"}){return 3}'
    )
  })
  it.skip/*TODO*/('compiles bytecode to Javascript', () => {
    assert.deepEqual(jscomp.stringify([
      ['fn', ['name', 'foo']],
      ['push', ['name', 'i']],
      ['push', ['name', ':decr']],
      ['call', 1],
      ['push', 1],
      ['push', ['name', 'i']],
      ['push', ['name', ':decrby']],
      ['call', 2],
      ['push', 'bar'],
      ['push', { foo: 1 }],
      ['fn', null],
      ['push', 3],
      ['ret'],
      ['end'],
      ['push', 4],
      ['push', ['name', 'bar']],
      ['call', 6],
      ['end']
      /*
       * TODO
      ['push', ['name', 'foo']],
      ['call', 0],
      ['push', 6],
      ['var', 'const', 'x']
      */
    ], {debug:1}), 'function foo(){i--;i-=1;bar(4,()=>{return 3},{foo:"bar"})}') // foo();const x=6;')
  })
  it('can beautify the code if asked to')
})
