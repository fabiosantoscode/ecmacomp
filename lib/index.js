'use strict'

const assert = require('assert')
const traverse = require('ast-traverse')
const parse = require('./parser')

module.exports = code => {
  const convert = arg => {
    if (arg.type === 'Identifier') return ['name', arg.name]
    if (arg.type === 'Literal') return arg.value
  }
  let returnFalse = false
  const add = node => {
    let out = []
    if (node.type === 'Program') return
    if (node.type === 'BlockStatement') return
    if (node.type === 'Identifier') return
    if (node.type === 'Literal') return
    if (node.type === 'ExpressionStatement') return
    if (node.type === 'IfStatement') {
      const length = out.length
      if (node.consequent) {
        out.push(['fn'])
        out = out.concat(add(node.consequent))
        out.push(['end'])
      }
      if (node.alternate) {
        out.push(['fn'])
        out = out.concat(add(node.alternate))
        out.push(['end'])
      }
      out = out.concat(add(node.test))
      out.push(['push', ['name', ':if']])
      out.push(['call', out.length - length - 1])
      returnFalse = true
    } else if (node.type === 'TryStatement') {
      console.log(node)
      const length = out.length
      if (node.finalizer) {
        out.push(['fn'])
        out = out.concat(add(node.finalizer))
        out.push(['end'])
      }
      if (node.handler) {
        out.push(['fn'])
        out = out.concat(add(node.handler))
        out.push(['end'])
      }
      if (node.block) {
        out.push(['fn'])
        out = out.concat(add(node.alternate))
        out.push(['end'])
      }
      if (node.handler && node.handler.param) {
        assert(node.handler.param.type === 'Identifier')
        out.push(['push', ['name', node.handler.param.name]])
      } else {
        out.push(['push', ''])
      }
      out.push(['push', ['name', ':try']])
      out.push(['call', out.length - length - 1])
      returnFalse = true
    } else if (node.type === 'FunctionDeclaration') {
      out.push(['fn', convert(node.id)])
      let toAdd = []
      traverse(node.body, {
        pre (node) {
          if (node.type === 'FunctionDeclaration') return
          toAdd = toAdd.concat(add(node) || [])
          if (returnFalse) return (returnFalse = false)
        }
      })
      out.push(...toAdd)
      out.push(['end'])
      returnFalse = true
    } else if (node.type === 'CallExpression') {
      node.arguments.forEach(arg => { out.push(['push', convert(arg)]) })
      out.push(['push', convert(node.callee)])
      out.push(['call', node.arguments.length])
    } else if (node.type === 'VariableDeclaration') {
      node.declarations.forEach(decl => {
        out.push(['push', decl.init ? convert(decl.init) : undefined])
        out.push(['var', node.kind, decl.id.name])
      })
      returnFalse = true
    } else {
      throw new Error('Unknown node type ' + node.type)
    }
    return out
  }
  let out = []
  traverse(parse(code), {
    pre (node) {
      out = out.concat(add(node) || [])
      if (returnFalse) return (returnFalse = false)
    }
  })
  out.push(['end'])
  return out
}

module.exports.stringify = require('./stringify')
