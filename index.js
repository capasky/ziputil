
'use strict';

const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const url = require('url');
const moment = require('moment');
const Promise = require('bluebird');
const request = require('request');
const archiver = require('archiver');
const AdmZip = require('adm-zip');
const debug = require('debug')('util-Zip');

/**
 * zip/unzip utils
 * @class ZipUtil
 * @author capasky(hzyangzhouzhi@corp.netease.com)
 */
class ZipUtil {
    /**
     * Get remote files and then compress them into one zip package
     * All remote files will be downloaded to the local tmp directory 
     * and deleted after generating the zip package successfully
     * @param   {Array<String>}  urls    a string array for all remote files' url
     * @param   {String}    destDir the path for saving zip package
     * @param   {Object}    options options
     * @param   {Object}    options.cwd cwd, default to process.cwd()
     * @param   {Object}    options.tmp temporary directory to save remote files, default to /tmp
     */
    static zipRemote(items, destDir, options) {
        options = options || {};
        let cwd = options.cwd || process.cwd();
        let dir = path.join(cwd, destDir);
        let fileTmpDir = path.join(dir, options.tmp || '/tmp');
        fs.ensureDirSync(fileTmpDir);
        let tasks = items.map(item => {
            return new Promise((resolve, reject) => {
                let url = item.url;
                let filename = item.filename;
                let targetFilename = path.join(fileTmpDir, filename);
                debug('request file from ', url, 'to', targetFilename);
                request.get(url)
                    .on('error', reject)
                    .pipe(fs.createWriteStream(targetFilename).on('close', resolve));
            });
        });
        return Promise.all(tasks).then(() => {
            debug('begin to zip');
            return new Promise((resolve, reject) => {
                let archive = archiver('zip');
                let zipFileName = options.zipFileName || `${moment().format('YYYYMMDDHHmmss')}.zip`;
                let zipFilePath = path.join(dir, zipFileName);
                debug('save to file', zipFilePath);
                let output = fs.createWriteStream(zipFilePath);
                archive.on('error', reject);
                output.on('close', () => {
                    debug('completed.....');
                    resolve({
                        filename: zipFileName,
                        path: zipFilePath
                    });
                });
                archive.pipe(output);
                debug('bulk to', fileTmpDir);
                archive.bulk([{
                    expand: true,
                    cwd: fileTmpDir,
                    src: ['**'],
                    dest: options.dest || ''
                }]);
                archive.finalize();
            });
        })
        .catch(err => {
            debug(err);
            return null;
        })
        .finally(() => {
            fs.remove(fileTmpDir, err => {
                debug(err);
            });
        })
    };
    /**
     * Extract a file from zip package to tmp directory and 
     * this file will be deleted in the finally stage of the returned Promise 
     * @param   {String}    zipFile   path of zip package
     * @param   {String}    targetFile  target file path in the zip package, relative to the root of 
     *                                  the  package, such as res/logo.png
     * @returns {Promise<String>}   Promise resolved with the extracted file path
     */
    static extractFile(zipFile, targetFile) {
        let ext = path.extname(targetFile);
        let basename = path.basename(targetFile, ext);
        let output = path.join(os.tmpDir(),
            `${moment().format('YYYYMMDDHHmmss')}${Math.floor(Math.random() * 1000)}`);
        let outputFile = path.join(output, `${basename}${ext}`);
        return new Promise((resolve, reject) => {
            debug(`parse zip file ${zipFile}`);
            const zip = new AdmZip(zipFile);
            zip.extractEntryTo(targetFile, output, false, true);
            resolve(outputFile);
        })
        .finally(() => {
            debug(`remove output ${output}`)
            fs.remove(output, debug);
        });
    }
};

module.exports = ZipUtil;