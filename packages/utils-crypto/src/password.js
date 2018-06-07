// @flow

import sodium from 'sodium-universal'

export const PASSWORDHASH_ALG_ARGON2I13: number =
  sodium.crypto_pwhash_ALG_ARGON2I13
export const PASSWORDHASH_ALG_ARGON2ID13: number =
  sodium.crypto_pwhash_ALG_ARGON2ID13
export const PASSWORDHASH_ALG_DEFAULT: number = sodium.crypto_pwhash_ALG_DEFAULT
export const PASSWORDHASH_MEMLIMIT_INTERACTIVE: number =
  sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE
export const PASSWORDHASH_MEMLIMIT_MAX: number =
  sodium.crypto_pwhash_MEMLIMIT_MAX
export const PASSWORDHASH_MEMLIMIT_MIN: number =
  sodium.crypto_pwhash_MEMLIMIT_MIN
export const PASSWORDHASH_MEMLIMIT_MODERATE: number =
  sodium.crypto_pwhash_MEMLIMIT_MODERATE
export const PASSWORDHASH_MEMLIMIT_SENSITIVE: number =
  sodium.crypto_pwhash_MEMLIMIT_SENSITIVE
export const PASSWORDHASH_OPSLIMIT_INTERACTIVE: number =
  sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE
export const PASSWORDHASH_OPSLIMIT_MAX: number =
  sodium.crypto_pwhash_OPSLIMIT_MAX
export const PASSWORDHASH_OPSLIMIT_MIN: number =
  sodium.crypto_pwhash_OPSLIMIT_MIN
export const PASSWORDHASH_OPSLIMIT_MODERATE: number =
  sodium.crypto_pwhash_OPSLIMIT_MODERATE
export const PASSWORDHASH_OPSLIMIT_SENSITIVE: number =
  sodium.crypto_pwhash_OPSLIMIT_SENSITIVE
export const PASSWORDHASH_SALTBYTES: number = sodium.crypto_pwhash_SALTBYTES

export const hashPassword = (
  hash: Buffer,
  password: Buffer,
  salt: Buffer,
  opslimit?: number = PASSWORDHASH_OPSLIMIT_MODERATE,
  memlimit?: number = PASSWORDHASH_MEMLIMIT_MODERATE,
  algorithm?: number = PASSWORDHASH_ALG_DEFAULT,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      sodium.crypto_pwhash_async(
        hash,
        password,
        salt,
        opslimit,
        memlimit,
        algorithm,
        (err: ?Error) => {
          if (err == null) resolve(hash)
          else reject(err)
        },
      )
    } catch (err) {
      reject(err)
    }
  })
}
