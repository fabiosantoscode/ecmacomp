'use strict'

const assert = require('assert')

const stringify = bytecode => {
  let i = bytecode.length - 1
  let inSomething = 0
  const readFunction = () => {
    const enclosedCode = []
    i--
    if (!bytecode[i]) return []
    let inSomething = 0
    do {
      const [op, arg] = bytecode[i]
      if (op === 'end') inSomething++
      if (op === 'fn') { inSomething--; i--; continue }
      const [newCode, newI] = toCode(i, inSomething)
      enclosedCode.push(newCode)
      i = newI
    } while (bytecode[i] && inSomething)
    return [enclosedCode, i]
  }
  const atom = inpt => {
    if (typeof inpt === 'number' || inpt == null) return inpt
    if (typeof inpt === 'string') return JSON.stringify(inpt)
    if (inpt[0] === 'name') return inpt[1]
    assert(false)
  }
  const readValue = index => {
    const [op, arg] = bytecode[index]
    if (op === 'push') {
      i--
      if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
        const obj = {}
        Object.keys(arg).forEach(key => {
          const sourceI = arg[key]
          i -= sourceI
          obj[key] = readValue(i)
        })
        return JSON.stringify(obj)
      }
      return atom(arg)
    } else if (op === 'fn') {
      return ''
    } else if (op === 'end') {
      const [fn, newI] = readFunction()
      i = newI
      return fn.join('')
    } else {
      throw new Error('readValue: can\'t read bytecode ' + op)
    }
  }
  const readArguments = length => {
    return Array(length).join('x').split('x').map(() => {
      const [op, arg] = bytecode[i]
      if (op === 'push') {
        return readValue(i)
      } else {
        throw new Error('cant read argument bytecode ' + op)
      }
    }).reduce((a, b) => a.concat(b), [])
  }
  const toCode = (i, inSomething) => {
    console.log(bytecode[i])
    const [op, arg] = bytecode[i]
    let code
    if (op === 'var') {
      code = `${arg} ${bytecode[i][2]}=${readValue(i - 1)};`
      i -= 2
    } else if (op === 'call') {
      i--
      const fname = readValue(i)
      const args = readArguments(arg + 1)
      console.log({fname, args, bytecode, i})
      code = `${fname}(${args.join(',')});`
    } else if (op === 'push') {
      code = `${readValue(i)}`
      i--
    } else if (op === 'ret') {
      i--
      code = `return ${atom(arg)};`
    } else if (op === 'end') {
      console.log(bytecode, i)
      const [enclosedCode, newI] = readFunction()
      i = newI
      const fname = readValue(i--)
      code = `function ${fname}(){${enclosedCode.join('')}}`
    } else {
      throw new Error('Unknown bytecode ' + op)
    }
    return [code, i]
  }
  let code = []
  while (i > 0 && bytecode[i]) {
    const [op, arg] = bytecode[i]
    if (op === 'fn') {
      inSomething++
    } else if (op === 'end' && i === bytecode.length - 1) {
      i--
      continue
    } else if (op === 'end') {
      inSomething--
    }
    if (!bytecode[i]) break
    const [outCode, newI] = toCode(i, inSomething)
    console.log('bcc', bytecode[i])
    i = newI
    code.push(outCode)
  }
  return code.reverse().join('')
}

module.exports = stringify
