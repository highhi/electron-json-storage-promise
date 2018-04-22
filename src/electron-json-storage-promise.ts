'use strict'

import { app } from 'electron'
import * as fs from 'fs-extra'
import isPlainObject = require('lodash.isplainobject')
import * as path from 'path'
import * as rimraf from 'rimraf'

let storagePath: string

function getFilePath(storageKey: string): string {
  const key = storageKey.trim()

  if (typeof key !== 'string' || !key) {
    throw new TypeError('Invaild key')
  }

  const escapedKey = encodeURIComponent(`${path.basename(key, '.json')}.json`)

  return path.join(getStoragePath(), escapedKey)
}

export function getStoragePath(): string {
  return storagePath || path.join(app.getPath('userData'), 'storage')
}

export function setStoragePath(dir: string): void {
  storagePath = dir
}

export interface IData {
  [key: string]: any
}

export function get(key: string): Promise<IData> {
  if (!has(key)) {
    return Promise.resolve(Object.create(null))
  }
  return fs.readJSON(getFilePath(key))
}

export function set(key: string, data: IData): Promise<IData> {
  if (!isPlainObject(data)) {
    throw new TypeError('The second argument must be a plain object.')
  }

  // If there is no directory, create it.
  fs.ensureDirSync(getStoragePath())
  return get(key).then(obj => {
    const mergedData = Object.assign({}, obj, data)
    return fs.writeJSON(getFilePath(key), mergedData).then(() => mergedData)
  })
}

export function has(key: string): boolean {
  return fs.pathExistsSync(getFilePath(key))
}

export function keys(): Promise<string[]> {
  return fs
    .readdir(getStoragePath())
    .then((keys: string[]) => keys.filter(key => path.extname(key) === '.json'))
    .then((keys: string[]) => keys.map(key => path.basename(key, '.json')))
}

export function remove(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    rimraf(getFilePath(key), err => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

export function clear(): Promise<void[]> {
  return keys().then(keys => Promise.all(keys.map(key => remove(key))))
}
