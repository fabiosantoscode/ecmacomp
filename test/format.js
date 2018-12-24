'use strict'

let assert = require('assert')
assert = assert.strict || assert
const format = require('../lib/format')

describe('format', () => {
  it('formats a bytecode for reading', () => {
    assert.equal(format([
      ['push', 'foo whoo spaces!'],
      ['call', 0],
      ['fn', ['name', 'foo'], ['name', 'a', {def: [['push', 4]]}], ['array'], ['name', 'b'], ['name', 'c', {spread:1}], ['end'], ['object'], ['kv', 'foo', [['push', 'foo']]], ['end']],
      ['push', 3],
      ['ret'],
      ['end']
    ]), `[push "foo whoo spaces!"]
[call 0]
[fn [name foo] [name a {def: [[push 4]]}] [array] [name b] [name c {spread}] [end] [object] [kv foo [[push foo]]] [end]]
[push 3]
[ret]
[end]`)
  })
})
