# jscomp [![Build Status](https://travis-ci.org/fabiosantoscode/jscomp.svg?branch=master)](https://travis-ci.org/fabiosantoscode/jscomp)

Compile javascript modules, optimize them with prepack, and minify with terser if `NODE_ENV` is `production`. Reduce your code in production today!

Further optimizations are coming up:

 - Caching React elements in variables and modifying them before passing them to React.createElement
 - Turning fs.readFileSync and other sync APIs into their Promise counterparts, and turning every function above the call into an async function
 - Removing react completely using rawact
 - Reducing GC allocations
 - Caching some function results
 - ...And other amazing optimizations

## Usage (CLI)

```bash
$ jscomp input.js [--norollup] [--noprepack]
```

## Usage (JS API)

```javascript
await require('jscomp')({ filename: 'input.js' })
```
