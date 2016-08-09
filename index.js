/**
 * Utils - ZIP
 * zip/unzip 工具
 * @author capasky(hzyangzhouzhi@corp.netease.com)
 */

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

class ZipUtil {
    /**
     * 获取远程文件并压缩为压缩包
     * 远程文件会下载到本地临时目录，在压缩包生成后会删除
     * @param   {Array<String>}  urls    远程url数组
     * @param   {String}    destDir 压缩包存储目标路径
     * @param   {Object}    options 配置参数
     * @param   {Object}    options.cwd 工作目录路径，默认 process.cwd()
     * @param   {Object}    options.tmp 远程文件存储临时目录，默认 /tmp
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
     * 从ZIP包中解压出单个文件，文件会解压到临时目录，并且会自动删除
     * @param   {String}    zipFile   zip文件路径
     * @param   {String}    targetFile  要解压的压缩包中的目标文件，路径相对于压缩包根，如 res/logo.png
     * @returns {Promise<String>}   解压成功时以 解压的文件的路径 resolve
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