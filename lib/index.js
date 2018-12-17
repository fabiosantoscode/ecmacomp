'use strict'

const traverse = require('ast-traverse')
const parse = require('./parser')

module.exports = code => {
  const convert = arg => {
    if (arg.type === 'Identifier') return ['name', arg.name]
    if (arg.type === 'Literal') return arg.value
  }
  let returnFalse = false
  const add = node => {
    const out = []
    if (node.type === 'Program') return
    if (node.type === 'BlockStatement') return
    if (node.type === 'Identifier') return
    if (node.type === 'Literal') return
    if (node.type === 'ExpressionStatement') return
    if (node.type === 'FunctionDeclaration') {
      out.push(['function', convert(node.id)])
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
        out.push(['const', decl.id.name])
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
