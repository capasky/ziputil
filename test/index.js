/**
 * Unit Test for utils-zip
 * @author  capasky(hzyangzhouzhi@corp.netease.com)
 */

'use strict';

const path = require('path');
const expect = require('expect.js');
const Promise = require('bluebird');
const fs = require('fs-extra');

const zip = require('../');

describe('ziputil', () => {
    const zipFile = path.join(__dirname, './assets/x.zip');
    const targetFile = 'x1/x.txt';
    describe('#extractFile', () => {
        it('should extract file from a zip file', done => {
            let tmp;
            zip.extractFile(zipFile, targetFile)
                .then(x => {
                    tmp = x;
                    return new Promise((resolve, reject) => {
                        fs.readFile(x, (err, data) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve(data);
                        });
                    });
                })
                .then(content => {
                    let c = content.toString().replace(/\n|\r/g, '');
                    expect(c).to.be(`Hello world!123456789`);
                    done();
                });
        });
    });

    describe('#zipRemote', () => {
    });
});