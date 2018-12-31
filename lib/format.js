const assert = require('assert')

module.exports = bytecode => {
  assert(bytecode.every(bc => bc != null), 'There\'s an undefined or null in the bytecode')
  return bytecode.map(bc => {
    return `[${bc.map(function thisfunc (innerBc) {
      if (typeof innerBc === 'string') {
        if (/[ [\]]/.test(innerBc)) return JSON.stringify(innerBc)
        return innerBc
      }
      if (typeof innerBc === 'number') return innerBc
      if (Array.isArray(innerBc)) {
        if (bc[0] !== 'fn') return `${module.exports(innerBc)}`
        else return `[${innerBc.map(thisfunc).join(' ')}]`
      }
      if (innerBc == null) return null
      if (typeof innerBc === 'object') {
        return `{${Object.keys(innerBc).map(key => {
          let value = innerBc[key]
          if (Array.isArray(value) || typeof value === 'string' || typeof value === 'number' || value == null) {
            value = thisfunc(value)
          }
          if (value === 1) return key
          return key + ': ' + value
        }).join(', ')}}`
      }
    }).join(' ')}]`
  }).join('\n')
}
