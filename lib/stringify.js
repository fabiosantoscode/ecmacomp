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
      if (isStart()) inSomething--
      if (op === 'fn') { i--; continue }
      const [newCode, newI] = toCode(i, inSomething)
      enclosedCode.push(newCode)
      i = newI
    } while (bytecode[i] && inSomething)
    return [enclosedCode, i]
  }
  const atom = inpt => {
    if (
      typeof inpt === 'number' ||
      typeof inpt === 'string' ||
      inpt == null
    ) return inpt
    if (inpt[0] === 'name') return inpt[1]
  }
  const convert = index => {
    const [op, arg] = bytecode[index]
    if (op === 'push') {
      i--
      if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
        Object.keys(arg).forEach(key => {
          const sourceI = arg[key]
          i = sourceI
        })
        return arg
      }
      return atom(arg)
    } else if (op === 'fn') {
      return undefined
    } else if (op === 'end') {
      const fn = readFunction()
      console.log({fn})
      i--
    } else {
      throw new Error('convert: can\'t convert bytecode ' + op)
    }
  }
  const readArguments = length => {
    assert(length < i)
    return Array(length).join('x').split('x').map(() => {
      console.log(bytecode[i])
      const [op, arg] = bytecode[i]
      if (op === 'push') {
        return convert(i--)
      } else {
        throw new Error('cant read argument bytecode ' + op)
      }
    }).reduce((a, b) => a.concat(b), [])
  }
  const isStart = () => {
    assert(bytecode[i])
    const [op, arg] = bytecode[i]
    if (op === 'fn') return true
  }
  const toCode = (i, inSomething) => {
    const [op, arg] = bytecode[i]
    let code
    if (op === 'var') {
      code = `${arg} ${bytecode[i][2]}=${convert(i - 1)};`
      i -= 2
    } else if (op === 'call') {
      const fname = convert(i - 1)
      i -= 2
      const args = readArguments(arg)
      code = `${fname}(${args.join(',')});`
    } else if (op === 'ret') {
      code = `return ${convert(i--)};`
    } else if (op === 'end') {
      const [enclosedCode, newI] = readFunction()
      i = newI
      const fname = arg[1]
      i--
      code = `function ${fname}(){${enclosedCode.join('').replace(/;$/, '')}}`
    } else {
      throw new Error('Unknown bytecode ' + op)
    }
    return [code, i]
  }
  let code = []
  while (i > 0 && bytecode[i]) {
    const [op, arg] = bytecode[i]
    if (isStart()) {
      inSomething++
    } else if (op === 'end' && i === bytecode.length - 1) {
      i--
      continue
    } else if (op === 'end') {
      inSomething--
    }
    if (!bytecode[i]) break
    const [outCode, newI] = toCode(i, inSomething)
    i = newI
    code.push(outCode)
  }
  return code.reverse().join('')
}

module.exports = stringify
