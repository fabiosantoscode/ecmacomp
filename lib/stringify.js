'use strict'

const assert = require('assert')

const stringify = (bytecode, { beautiful = false, debug = false } = {}) => {
  const readInside = (bytecode, i) => {
    const code = []
    while (bytecode[i]) {
      if (bytecode[i][0] === 'fn') { i--; break }
      const [ncode, newI] = toCode(bytecode, i)
      i = newI
      code.push(ncode)
    }
    code.reverse()
    return [code, i]
  }
  const atom = (inpt, extra) => {
    if (typeof inpt === 'string') return JSON.stringify(inpt)
    if (typeof inpt === 'boolean' || typeof inpt === 'number' || inpt == null) return String(inpt)
    if (inpt[0] === 'name') {
      if (extra && extra.spread) return '...' + inpt[1]
      return inpt[1]
    }
    assert(false, 'could not read atom ' + JSON.stringify(inpt))
  }
  const readValue = (bytecode, i) => {
    const [op, arg, extra] = bytecode[i]
    if (op === 'push') {
      i--
      const ary = Array.isArray(arg) && arg[0] !== 'name'
      const obj = !ary && (typeof arg === 'object' && arg !== null && !Array.isArray(arg))
      if (!ary && !obj) {
        return [atom(arg, extra), () => i]
      } else if (ary) {
        const ary = []
        let minI = i
        arg.forEach(sourceI => {
          const [value, newI] = readValue(bytecode, i - sourceI)
          if (newI() < minI) minI = newI()
          ary.push(value)
        })
        i = minI
        return ['[' + ary + ']', () => i]
      } else if (obj) {
        const obj = []
        const start = i
        let minI = i
        Object.keys(arg).forEach(key => {
          const sourceI = arg[key]
          const [value, newI] = readValue(bytecode, start - sourceI)
          if (newI() < minI) minI = newI()
          obj.push([key, value])
        })
        i = minI
        return [`{${obj.map(([k, v]) => `${JSON.stringify(k)}:${v}`)}}`, () => i]
      } else {
        assert(false)
      }
    } else if (op === 'end' || op === 'call') {
      const [fnOrCall, newI] = toCode(bytecode, i)
      return [fnOrCall, () => newI]
    } else {
      throw new Error('readValue: can\'t read bytecode ' + op + ' at [' + bytecode[i].join(' ') + ']')
    }
  }
  const readParameter = (params, i) => {
    let [op, arg, arg2] = params[i]
    let param
    if (op === 'name') {
      i--
      if (arg2 && arg2.spread) arg = '...' + arg
      if (arg2 && arg2.def) arg += '=' + stringify(arg2.def)
      param = arg
    } else if (op === 'end') {
      i--
      const destructured = []
      while (params[i][0] !== 'array' && params[i][0] !== 'object') {
        assert(params[i])
        const [value, newI] = readParameter(params, i)
        i = newI
        destructured.push(value)
      }
      const isArray = params[i] && params[i][0] === 'array'
      i--
      param = destructured.reverse().join(',')
      param = isArray ? `[${param}]` : `{${param}}`
    } else {
      throw new Error('Unknown parameter type ' + op)
    }
    return [param, i]
  }
  const readParameters = params => {
    const out = []
    let i = params.length - 1

    while (i >= 0) {
      const [param, newI] = readParameter(params, i)
      out.push(param)
      i = newI
    }
    return out.reverse()
  }
  const readArguments = (bytecode, i, length) => {
    if (length <= 0) return [[], i]
    const args = []
    for (let _ = 0; _ < length && bytecode[i]; _++) {
      const [op] = bytecode[i]
      if (op === 'end' || op === 'call' || op === 'push') {
        const [value, newI] = toCode(bytecode, i)
        i = newI
        if (bytecode[i] && bytecode[i][0] === 'fn') i-- // TODO probably a bug elsewhere
        args.push(value)
      } else {
        console.log('before argument error', bytecode[i])
        throw new Error('cant read argument bytecode ' + op)
      }
    }
    return [args.reverse(), i]
  }
  const toCode = (bytecode, i) => {
    if (debug) console.log(`toCode [${bytecode[i][0]} ${bytecode[i][1] ? JSON.stringify(bytecode[i][1]) : ''}]`)
    let [op, arg, arg2] = bytecode[i]
    let code
    if (op === 'var') {
      const hasInit = bytecode[i][3]
      i--
      const [value, newI] = hasInit ? readValue(bytecode, i) : [null, i]
      i = newI()
      if (value) code = `${arg} ${arg2}=${value}`
      else code = `${arg} ${arg2}`
    } else if (op === 'call') {
      const [allArgs, newI] = readArguments(bytecode, --i, arg)
      const [fname, ...args] = allArgs
      i = newI
      code = {
        ':decr': variable => variable + '--',
        ':decrby': (variable, by) => variable + '-=' + by,
        ':op': (operator, ...operands) => {
          if (operator[0] === '"') {
            try {
              operator = JSON.parse(operator)
            } catch (e) { }
          }
          assert(operator)
          console.log(operator)
          return operands.join(operator)
        },
        ':membex': (object, member) => `${object}${/^[a-zA-Z0-9$]+$/.test(member) ? '.' + member : `[${JSON.stringify(member)}]`}`,
        ':assign': (left, right) => `${left}=${right}`,
        ':tern': (cond, then, otherwise) => `${cond}?${then}:${otherwise}`,
        ':seq': (...expressions) => `(${expressions.join(',')})`
      }[fname]
      assert(code || fname[0] !== ':', 'colon-function used that does not exist: ' + JSON.stringify(fname))
      if (code) code = `${code(...args)}`
      else code = `${fname}(${args.join(',')})`
    } else if (op === 'push') {
      const [value, newI] = readValue(bytecode, i)
      i = newI()
      code = value
    } else if (op === 'ret') {
      const [value, newI] = readValue(bytecode, --i)
      i = newI()
      code = `return ${value}`
    } else if (op === 'end') {
      const [enclosedCode, newI] = readInside(bytecode, --i)
      const body = `{${enclosedCode.join(';')}}`
      i = newI
      // readInside removes the function completely so we need +1
      const fnBc = bytecode[i + 1]
      // atom takes 2 arguments, and they happen to be 1 and 2 in this bytecode array
      const [, arg] = fnBc
      const fname = arg === '=>' ? '' : arg == null ? 'function' : 'function ' + arg
      const fargs = readParameters(fnBc.slice(2))
      code = `${fname}(${fargs.join(',')})${arg === '=>' ? arg : ''}${body}`
    } else {
      throw new Error('Unknown bytecode ' + op)
    }
    assert(code != null, 'Got code null at ' + JSON.stringify([op, arg]))
    assert(!isNaN(i), 'i is not a number (it is ' + i + '), reading bytecode ' + JSON.stringify([op, arg, arg2]))
    return [code, i]
  }
  const [code] = readInside(bytecode, bytecode.length - 1)
  return code.join(';')
}

module.exports = stringify
