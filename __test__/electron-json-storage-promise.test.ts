'use strict'

import * as fs from 'fs-extra'
import * as path from 'path'
import * as storage from '../lib/electron-json-storage-promise'

const TEMP_FILE = 'foo.json'
const TEMP_DIR_PATH = path.join(__dirname, '../tmp')
const TEMP_FILE_PATH = path.join(TEMP_DIR_PATH, TEMP_FILE)

storage.setStoragePath(TEMP_DIR_PATH)

describe('electron-json-storage-promise', () => {
  beforeEach(() => {
    return storage.set(TEMP_FILE, { foo: 'foo' })
  })

  afterEach(() => {
    return storage.clear()
  })

  describe('.set', () => {
    it('should be able to merge valid JSON properties if key exists', async () => {
      const data = await storage.set('foo', { baz: 'baz' })
      expect(data).toEqual({ foo: 'foo', baz: 'baz' })
    })

    it('should be able to store a valid JSON object if key not exists', async () => {
      const data = await storage.set('bar', { bar: 'bar' })
      const exists = await fs.pathExists(TEMP_DIR_PATH + '/bar.json')
      expect(data).toEqual({ bar: 'bar' })
      expect(exists).toBe(true)
    })

    it('should throw error if invalid second argument', () => {
      expect(() => {
        storage.set(TEMP_FILE, 'baz')
      }).toThrow('The second argument must be a plain object.')
    })
  })

  describe('.get', () => {
    it('should return storage object if key exist', async () => {
      const result = await storage.get('foo')
      expect(result).toEqual({ foo: 'foo' })
    })

    it('should return empty object if key not exist', async () => {
      const result = await storage.get('bar')
      expect(result).toEqual({})
    })

    it('should return error object', async () => {
      try {
        await storage.get('foo')
      } catch (err) {
        expect(err).toMatch('error')
      }
    })
  })

  describe('.has', () => {
    it('should return true if key exist', () => {
      expect(storage.has('foo')).toBe(true)
    })

    it('should return false if key not exist', () => {
      expect(storage.has('bar')).toBe(false)
    })
  })

  describe('.remove', () => {
    it('should be remove key', async () => {
      await storage.set('bar', { bar: 'bar' })
      await storage.remove('bar')
      const resultFalse = await fs.pathExists(TEMP_DIR_PATH + '/bar.json')
      const resultTrue = await fs.pathExists(TEMP_DIR_PATH + '/foo.json')

      expect(resultFalse).toBe(false)
      expect(resultTrue).toBe(true)
    })

    it('should return error object', async () => {
      try {
        await storage.remove('bar')
      } catch (err) {
        expect(err).toMatch('error')
      }
    })
  })

  describe('.clear', () => {
    it('should be remove all keys', async () => {
      await storage.set('bar', { bar: 'bar' })
      await storage.clear()
      const resultFalse1 = await fs.pathExists(TEMP_DIR_PATH + '/bar.json')
      const resultFalse2 = await fs.pathExists(TEMP_DIR_PATH + '/foo.json')

      expect(resultFalse1).toBe(false)
      expect(resultFalse2).toBe(false)
    })

    it('should return error object', async () => {
      try {
        await storage.clear()
      } catch (err) {
        expect(err).toMatch('error')
      }
    })
  })
})
