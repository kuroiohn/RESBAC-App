import CryptoJS from "crypto-js";
import { PASSPHRASE } from "@env";

const PASSPHRASEKEY = PASSPHRASE;

const deriveKey = (passphrase, salt) => {
  return CryptoJS.PBKDF2(passphrase, CryptoJS.enc.Hex.parse(salt), {
    keySize: 256 / 32,
    iterations: 10000,
  });
};

export const encryptData = (plainText) => {
  if (!plainText) return plainText;

  // generate random salt and IV using crypto-js
  const salt = CryptoJS.lib.WordArray.random(16).toString();
  const iv = CryptoJS.lib.WordArray.random(16).toString();

  const key = deriveKey(PASSPHRASEKEY, salt);

  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return JSON.stringify({
    salt,
    iv,
    ciphertext: encrypted.toString(),
  });
};

export const decryptData = (payload) => {
  if (!payload) return payload;

  const { salt, iv, ciphertext } = JSON.parse(payload);
  const key = deriveKey(PASSPHRASEKEY, salt);

  const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};
