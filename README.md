# ecmacomp [![Build Status](https://travis-ci.org/fabiosantoscode/ecmacomp.svg?branch=master)](https://travis-ci.org/fabiosantoscode/ecmacomp)

Compile javascript modules, optimize them with prepack and terser if `NODE_ENV` is `production`, and do more optimisations from this project. Reduce your code in production today!

Further optimizations are coming up:

 - Caching React elements in variables and modifying them before passing them to React.createElement
 - Turning fs.readFileSync and other sync APIs into their Promise counterparts, and turning every function above the call into an async function
 - Removing react completely using rawact
 - Reducing GC allocations
 - Caching some function results
 - ...And other amazing optimizations

## Usage (CLI)

You can disable rollup or prepack (to disable terser, use the `NODE_ENV` environment variable `NODE_ENV=production ecmacomp ...`)
```bash
$ ecmacomp input.js [--norollup] [--noprepack] [--public dir] [--output file]
```

## Usage (JS API)

```javascript
const code = await require('ecmacomp')({ filename: 'input.js' })
const code2 = await require('ecmacomp')('function code() {}')
```

## Hacking `ecmacomp`

To hack on ecmacomp, clone this repository (`git clone https://github.com/fabiosantoscode/ecmacomp`), `cd` to it, run `npm i`, write a test in the appropriate place, respect the lint (`npm run lint`) and start hacking :)

This CLI command reveals the bytecode for a piece of javascript:

```bash
$ ecmacomp --parse input.js
```

You can use this bytecode as reference because it's the bytecode used in all the optimisations.
