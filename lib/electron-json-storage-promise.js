'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs = require("fs-extra");
const isPlainObject = require("lodash.isplainobject");
const path = require("path");
const rimraf = require("rimraf");
let storagePath;
function getStoragePath() {
    return storagePath || path.join(electron_1.app.getPath('userData'), 'storage');
}
exports.getStoragePath = getStoragePath;
function setStoragePath(dir) {
    storagePath = dir;
}
exports.setStoragePath = setStoragePath;
function getFilePath(storageKey) {
    const key = storageKey.trim();
    if (typeof key !== 'string' || !key) {
        throw new TypeError('Invaild key');
    }
    const escapedKey = encodeURIComponent(`${path.basename(key, '.json')}.json`);
    return path.join(getStoragePath(), escapedKey);
}
function get(key) {
    if (!has(key)) {
        return Promise.resolve(Object.create(null));
    }
    return fs.readJSON(getFilePath(key));
}
exports.get = get;
function set(key, data) {
    if (!isPlainObject(data)) {
        throw new TypeError('The second argument must be a plain object.');
    }
    // If there is no directory, create it.
    fs.ensureDirSync(getStoragePath());
    return get(key).then(obj => {
        const mergedDate = Object.assign({}, obj, data);
        return fs.writeJSON(getFilePath(key), mergedDate).then(() => mergedDate);
    });
}
exports.set = set;
function has(key) {
    return fs.pathExistsSync(getFilePath(key));
}
exports.has = has;
function keys() {
    return fs
        .readdir(getStoragePath())
        .then((keys) => keys.filter(key => path.extname(key) === '.json'))
        .then((keys) => keys.map(key => path.basename(key, '.json')));
}
exports.keys = keys;
function remove(key) {
    return new Promise((resolve, reject) => {
        rimraf(getFilePath(key), err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}
exports.remove = remove;
function clear() {
    return keys().then(keys => Promise.all(keys.map(key => remove(key))));
}
exports.clear = clear;
//# sourceMappingURL=electron-json-storage-promise.js.map