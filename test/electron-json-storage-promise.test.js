'use strict';
const fs = require('fs-extra');
const path = require('path');
const storage = require('../lib/electron-json-storage-promise');

const TEMP_FILE = 'foo.json';
const TEMP_DIR_PATH = path.join(__dirname, '../tmp');
const TEMP_FILE_PATH = path.join(TEMP_DIR_PATH, TEMP_FILE);

storage.setStoragePath(TEMP_DIR_PATH);

describe('electron-json-storage-promise', () => {
  beforeEach(() => {    
    return storage.set(TEMP_FILE, { foo: 'foo' });
  });

  afterEach(() => {
    return storage.clear();
  });

  describe('.set', () => {
    it('should be able to store a valid JSON object', async () => {
      const data = await storage.set('bar', { bar: 'bar' });
      const exists = await fs.pathExists(TEMP_DIR_PATH + '/bar.json');
      expect(data).toEqual({ bar: 'bar' });
      expect(exists).toBe(true);
    });

    it('should throw erro if invalid second argument', () => {
      expect(() => {
        storage.set(TEMP_FILE, 'baz');
      }).toThrow('The second argument must be a plain object.');
    });
  });

  describe('.get', () => {
    it('should return storage object if key exist', () => {
      storage.get('foo').then(data => {
        expect(data).toEqual({ foo: 'foo' });
      });
    });

    it('should return undefined if key not exist', () => {
      storage.get('bar').then(data => {
        expect(data).toBeUndefined();
      });
    });
  });

  describe('.has', () => {
    it('should return true if key exist', () => {
      expect(storage.has('foo')).toBe(true);
    })

    it('should return false if key not exist', () => {
      expect(storage.has('bar')).toBe(false);
    });
  });

  describe('.remove', () => {
    it('should be remove key', async () => {
      await storage.set('bar', { bar: 'bar' })
      await storage.remove('bar');

      fs.pathExists(TEMP_DIR_PATH + '/bar.json').then(result => {
        expect(result).toBe(false);
      });

      fs.pathExists(TEMP_DIR_PATH + '/foo.json').then(result => {
        expect(result).toBe(true);
      });
    });
  });

  describe('.clear', () => {
    it('should be remove all keys', async () => {
      await storage.set('bar', { bar: 'bar' })
      await storage.clear();

      fs.pathExists(TEMP_DIR_PATH + '/bar.json').then(result => {
        expect(result).toBe(false);
      });

      fs.pathExists(TEMP_DIR_PATH + '/foo.json').then(result => {
        expect(result).toBe(false);
      });
    });
  });
});
