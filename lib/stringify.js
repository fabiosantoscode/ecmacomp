'use strict'

const stringify = bytecode => {
  let i = bytecode.length - 1
  let inSomething = 0
  const atom = inpt => {
    if (
      typeof inpt === 'number' ||
      typeof inpt === 'string' ||
      inpt == null
    ) return inpt
    if (inpt[0] === 'name') return inpt[1]
  }
  const convert = index => {
    if (bytecode[index][0] === 'push') {
      i--
      return atom(bytecode[index][1])
    }
  }
  const isStart = () => {
    if (bytecode[i] && bytecode[i][0] === 'function') return true
  }
  const toCode = (i, inSomething) => {
    let code
    if (bytecode[i][0] === 'push') return ['', i - 1]
    if (bytecode[i][0] === 'const') {
      code = `const ${bytecode[i][1]}=${convert(i - 1)};`
      i -= 2
    } else if (bytecode[i][0] === 'call') {
      const args = []
      const fname = convert(i - 1)
      const end = bytecode[i][1]
      for (var x = 0; x < end; x++) {
        args.push(convert(i - 2))
      }
      code = `${fname}(${args.join(',')});`
      i--
      i -= args.length
    } else if (bytecode[i][0] === 'end') {
      const enclosedCode = []
      let fname
      i--
      let inSomething = 1
      do {
        if (bytecode[i][0] === 'end') inSomething++
        if (isStart()) inSomething--
        if (bytecode[i][0] === 'function') { fname = bytecode[i][1][1]; break }
        const [newCode, newI] = toCode(i, inSomething)
        enclosedCode.push(newCode)
        i = newI
      } while (bytecode[i] && inSomething > 0)
      code = `function ${fname}(){${enclosedCode.join('')}}`
      i -= enclosedCode.length
    } else {
      throw new Error('Unknown bytecode ' + bytecode[i][0])
    }
    return [code, i]
  }
  console.log(i, bytecode[i])
  let code = []
  while (i > 0 && bytecode[i]) {
    if (isStart()) {
      inSomething++
    } else if (bytecode[i][0] === 'end' && i === bytecode.length - 1) {
      i--
      continue
    } else if (bytecode[i][0] === 'end') {
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
