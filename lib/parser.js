const acorn = require('acorn')
const jsx = require('acorn-jsx')

const parser = acorn.Parser.extend(jsx({
  allowNamespacedObjects: true
}))

module.exports = code => acorn.parse(code, { ecmaVersion: 9, sourceType: 'module' })
