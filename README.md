# ziputil
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
### extractFile(zipFile, targetFile)

## Run tests
```sh
npm install mocha -g #install mocha globally
npm test #run tests
```
