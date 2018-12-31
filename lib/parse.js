'use strict'

const assert = require('assert')
const traverse = require('ast-traverse') // TODO (good first issue) remove this module, as we always just return false and traverse by ourselves.
const parse = require('./parser')

module.exports = (code, { debug } = {}) => {
  let returnFalse = false
  const add = node => {
    if (debug) console.log('add', node)
    const readFunction = node => {
      if (Array.isArray(node)) return node.map(readFunction).reduce((a, b) => a.concat(b), [])
      let toAdd = []
      traverse(node, {
        pre (node) {
          toAdd = toAdd.concat(add(node) || [])
          if (returnFalse) return (returnFalse = false)
        }
      })
      return toAdd
    }
    let out = []
    if (node == null) return '' // TODO is this a bug?
    else if (node.type === 'Program') {
      node.body.forEach(bod => {
        out.push(...add(bod))
      })
      returnFalse = true
    } else if (node.type === 'ExpressionStatement') {
      out.push(...add(node.expression))
      returnFalse = true
    } else if (node.type === 'BlockStatement') {
      // TODO (good first issue) add anonymous block statement support by using an IIFE and hoisting vars in it.
      node.body.forEach(bod => {
        out.push(...add(bod))
      })
    } else if (node.type === 'Identifier') out.push(['push', ['name', node.name]])
    else if (node.type === 'Literal') out.push(['push', node.value])
    else if (node.type === 'BinaryExpression') {
      out.push(['push', ['name', ':op']])
      out.push(['push', node.operator])
      out.push(...add(node.left))
      out.push(...add(node.right))
      out.push(['call', 4])
      returnFalse = true
    } else if (node.type === 'TemplateLiteral') {
      out.push(['push', ['name', ':op']])
      out.push(['push', '+'])
      let additions = node.quasis.length
      for (var i = 0; i < node.quasis.length; i++) {
        out.push(['push', node.quasis[i].value.cooked])
        const exp = node.expressions[i]
        if (exp) {
          out.push(...add(exp))
          additions++
        }
      }
      out.push(['call', additions + 2])
      returnFalse = true
    } else if (node.type === 'MemberExpression') {
      if (!node.computed) {
        out.push(['push', ['name', ':membex']])
      } else {
        out.push(['push', ['name', ':subscript']])
      }
      out.push(...add(node.object))
      out.push(...add(node.property))
      out.push(['call', 3])
      returnFalse = true
    } else if (node.type === 'AssignmentExpression') {
      out.push(['push', ['name', ':assign']])
      out.push(...add(node.left))
      out.push(...add(node.right))
      out.push(['call', 3])
      returnFalse = true
    } else if (node.type === 'SequenceExpression') {
      out.push(['push', ['name', ':seq']])
      node.expressions.forEach(exp => {
        out.push(...add(exp))
      })
      out.push(['call', node.expressions.length + 1])
      returnFalse = true
    } else if (node.type === 'IfStatement') {
      out = out.concat(add(node.test) || [])
      out.push(['fn'])
      out.push(...readFunction(node.consequent))
      out.push(['end'])
      if (node.alternate) {
        out.push(['fn'])
        out.push(...readFunction(node.alternate))
        out.push(['end'])
      }
      out.push(['push', ['name', ':if']])
      out.push(['call', 2 + !!node.alternate])
      returnFalse = true
    } else if (node.type === 'SwitchStatement') {
      out.push(['push', ['name', ':switch']])
      out.push(...add(node.discriminant))
      out.push(['fn'])
      node.cases.forEach(kase => {
        if (kase.test) {
          out.push(...add(kase.test))
          out.push(['case'])
        } else {
          out.push(['case', { def: 1 }])
        }
        kase.consequent.forEach(cons => {
          out.push(...add(cons))
        })
      })
      out.push(['end'])
      out.push(['call', 3])
      returnFalse = true
    } else if (node.type === 'DoWhileStatement') {
      const length = out.length
      out.push(add(node.test))
      out.push(...readFunction(node.body))
      out.push(['push', ['name', ':dwhl']]) // TODO try to make this and the while statement and the for loop just one thing
      out.push(['call', out.length - length - 1])
      returnFalse = true
    } else if (node.type === 'WhileStatement') {
      out.push(add(node.test))
      out.push(...readFunction(node.body))
      returnFalse = true
    } else if (node.type === 'TryStatement') {
      let length = 1
      out.push(['push', ['name', ':try']])
      if (node.block) {
        length++
        out.push(['fn'])
        out.push(...readFunction(node.block))
        out.push(['end'])
      }
      if (node.handler) {
        length += 2
        assert(node.handler.param)
        out.push(...add(node.handler.param))
        out.push(['fn'])
        out.push(...readFunction(node.handler.body))
        out.push(['end'])
      }
      if (node.finalizer) {
        length++
        out.push(['fn'])
        out.push(...readFunction(node.finalizer.body))
        out.push(['end'])
      }
      out.push(['call', length])
      returnFalse = true
    } else if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
      out.push(['fn', node.id && ['name', node.id.name]])
      out.push(...readFunction(node.body))
      out.push(['end'])
      returnFalse = true
    } else if (node.type === 'ArrowFunctionExpression') {
      out.push(['fn', '=>'])
      if (node.body.type !== 'BlockStatement') {
        out.push(...add(node.body))
        out.push(['ret'])
      } else {
        out.push(...readFunction(node.body))
      }
      out.push(['end'])
      returnFalse = true
    } else if (node.type === 'CallExpression') {
      out.push(...add(node.callee))
      node.arguments.forEach(arg => { out.push(...add(arg)) })
      out.push(['call', node.arguments.length + 1])
      returnFalse = true
    } else if (node.type === 'VariableDeclaration') {
      node.declarations.forEach(decl => {
        if (decl.init) out.push(...add(decl.init))
        const init = decl.init ? [true] : []
        out.push(['var', node.kind, decl.id.name, ...init])
      })
      returnFalse = true
    } else if (node.type === 'ReturnStatement') {
      out.push(...add(node.argument))
      out.push(['ret'])
      returnFalse = true
    } else if (node.type === 'BreakStatement') {
      assert(!node.label, 'labelled break not supported yet')
      out.push(['break'])
    } else if (node.type === 'ConditionalExpression') {
      out.push(['push', ['name', ':tern']])
      out.push(...add(node.test))
      out.push(...add(node.consequent))
      out.push(...add(node.alternate))
      out.push(['call', 4])
      returnFalse = true
    } else {
      throw new Error('Unknown node type ' + node.type)
    }
    return out
  }
  let out = []
  traverse(typeof code === 'string' ? parse(code) : code, {
    pre (node) {
      out = out.concat(add(node) || [])
      if (returnFalse) return (returnFalse = false)
    }
  })
  return out
}
