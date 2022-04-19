/**
 * Data is stored in base64 format. Initially it was binary data
 * Format used in this encryption module.
 * inspired by AndiDittrich
 * +--------------------+-----------------------+----------------+----------------+
 * | SALT               | Initialization Vector | Auth Tag       | Payload        |
 * | Used to derive key | AES GCM XOR Init      | Data Integrity | Encrypted Data |
 * | 64 Bytes, random   | 16 Bytes, random      | 16 Bytes       | (N-96) Bytes   |
 * +--------------------+-----------------------+----------------+----------------+
 * This module doesn't take care of data persistence, it's assumed the consuming method/class/package will do so.
 */
import fs, { promises as fsp } from 'fs';
import crypto from 'crypto';
import { homedir } from 'os';
import { promisify } from 'util';
import { printMessage } from './Console.js';

const scrypt = promisify(crypto.scrypt);
//using WeakMaps for added security since  it gets garbage collected
const _masterKey = new WeakMap();
const _nonce = new WeakMap();
const _salt = new WeakMap();
const _key = new WeakMap();
const _encrypt = new WeakMap();

class DataProtection {
  constructor() {
    const masterKeyPath = () => `${homedir()}/.frodo/masterkey.key`;
    //Generates a master key in base64 format. This master key will be used to derive the key for encryption. this key should be protected by an HSM or KMS
    _masterKey.set(this, async () => {
      try {
        if (!fs.existsSync(masterKeyPath())) {
          const masterKey = crypto.randomBytes(32).toString('base64');
          await fsp.writeFile(masterKeyPath(), masterKey);
        }
        return await fsp.readFile(masterKeyPath(), 'utf8');
      } catch (err) {
        printMessage(err.message, 'error');
      }
    });

    // the nonce for AES GCM
    _nonce.set(this, () => {
      return crypto.randomBytes(16);
    });

    //The salt
    _salt.set(this, () => {
      return crypto.randomBytes(64);
    });

    //The function that derives the key, this supports sync and async operations
    _key.set(this, async (masterKey, salt) => {
      return await scrypt(masterKey, salt, 32);
    });

    //private method to encrypt and return encrypted data. cleaner code
    _encrypt.set(this, (key, nonce, data, salt) => {
      const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce);
      const encrypted = Buffer.concat([
        cipher.update(JSON.stringify(data), 'utf8'),
        cipher.final(),
      ]);
      const tag = cipher.getAuthTag();
      const buffer = Buffer.concat([salt, nonce, tag, encrypted]);
      return buffer.toString('base64');
    });
  }

  async encrypt(data) {
    const nonce = _nonce.get(this)();
    const salt = _salt.get(this)();
    const masterKey = await _masterKey.get(this)();
    const key = await _key.get(this)(masterKey, salt);
    return _encrypt.get(this)(key, nonce, data, salt);
  }

  async decrypt(data) {
    const buffer = Buffer.from(data.toString(), 'base64');
    const salt = buffer.slice(0, 64);
    const nonce = buffer.slice(64, 80);
    const tag = buffer.slice(80, 96);
    const encrypted = buffer.slice(96);
    const masterKey = await _masterKey.get(this)();
    const key = await _key.get(this)(masterKey, salt);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
    decipher.setAuthTag(tag);
    return (
      JSON.parse(decipher.update(encrypted, 'binary', 'utf8') + decipher.final('utf8'))
    );
  }
}
export default DataProtection;