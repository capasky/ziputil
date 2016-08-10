# ziputil
[![npm](https://img.shields.io/npm/v/ziputil.svg?maxAge=2592000)](https://www.npmjs.com/package/ziputil)
[![Build Status](https://travis-ci.org/capasky/ziputil.svg?branch=develop)](https://travis-ci.org/capasky/ziputil) 
[![Known Vulnerabilities](https://snyk.io/test/github/capasky/ziputil/badge.svg)](https://snyk.io/test/github/capasky/ziputil)
[![npm dependencies](https://david-dm.org/capasky/ziputil/status.svg)](https://david-dm.org/capasky/ziputil)
[![npm devDependencies](https://david-dm.org/capasky/ziputil/dev-status.svg)](https://david-dm.org/capasky/ziputil?type=dev)
[![license](https://img.shields.io/github/license/capasky/ziputil.svg?maxAge=2592000)](https://opensource.org/licenses/MIT)

Utils to process zip file

## install
```sh
npm install ziputil --save
```

## usage
```javascript
const ziputil = require('ziputil');

const urls = [
    'http://www.example.com/x.html',
    'http://www.example.com/y.png'
]
ziputil.zipRemote(
    urls, //remote file urls 
    process.cwd() //zip file save path
);
```

## API

### zipRemote(items, destDir, options)
### extractFile(zipFile, targetFile, options)

## Run tests
```sh
npm install mocha -g #install mocha globally
npm test #run tests
```
