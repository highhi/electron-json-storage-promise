'use strict';

const { app } = require('electron');
const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');
const isPlainObject = require('lodash.isplainobject');

let storagePath;

function getStoragePath() {
  return storagePath || path.join(app.getPath('userData'), 'storage');
}

function setStoragePath(dir) {
  storagePath = dir;
}

function getFilePath(storageKey) {
  const key = storageKey.trim();

  if (typeof key !== 'string' || !key) {
    throw new TypeError('Invaild key');
  }

  const escapedKey = encodeURIComponent(`${path.basename(key, '.json')}.json`);

  return path.join(getStoragePath(), escapedKey);
}

function get(key) {
  if (!has(key)) return Promise.resolve();
  return fs.readJSON(getFilePath(key));
}

function set(key, data) {
  if (!isPlainObject(data)) {
    throw new TypeError('The second argument must be a plain object.');
  }

  // If there is no directory, create it.
  fs.ensureDirSync(getStoragePath());
  return fs
    .writeJSON(getFilePath(key), data)
    .then(() => get(key).then(obj => obj));
}

function has(key) {
  return fs.pathExistsSync(getFilePath(key));
}

function keys() {
  return fs
    .readdir(getStoragePath())
    .then(keys => keys.filter(key => path.extname(key) === '.json'))
    .then(keys => keys.map(key => path.basename(key, '.json')));
}

function remove(key) {
  return new Promise((resolve, reject) => {
    rimraf(getFilePath(key), err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function clear() {
  return keys().then(keys => Promise.all(keys.map(key => remove(key))));
}

exports.getStoragePath = getStoragePath;
exports.setStoragePath = setStoragePath;
exports.get = get;
exports.set = set;
exports.has = has;
exports.keys = keys;
exports.remove = remove;
exports.clear = clear;
