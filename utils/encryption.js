import RNSimpleCrypto from 'react-native-simple-crypto';
import {AES_KEY, IV} from '@env'

const SECRET_KEY = AES_KEY; // must be 16/24/32 bytes for AES
const FIXED_IV = IV

// Helper to convert string to ArrayBuffer
const str2ab = (str) => RNSimpleCrypto.utils.convertUtf8ToArrayBuffer(str);
// Helper to convert ArrayBuffer to string
const ab2str = (ab) => RNSimpleCrypto.utils.convertArrayBufferToUtf8(ab);

export const encryptData = async (data) => {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  const keyArrayBuffer = str2ab(SECRET_KEY);
  const ivArrayBuffer = str2ab(FIXED_IV);

  const encryptedArrayBuffer = await RNSimpleCrypto.AES.encrypt(
    text,
    keyArrayBuffer,
    ivArrayBuffer
  );

  return RNSimpleCrypto.utils.convertArrayBufferToHex(encryptedArrayBuffer);
};

export const decryptData = async (ciphertextHex) => {
  const keyArrayBuffer = str2ab(SECRET_KEY);
  const ivArrayBuffer = str2ab(FIXED_IV);
  const encryptedArrayBuffer = RNSimpleCrypto.utils.convertHexToArrayBuffer(ciphertextHex);

  const decrypted = await RNSimpleCrypto.AES.decrypt(
    encryptedArrayBuffer,
    keyArrayBuffer,
    ivArrayBuffer
  );

  return decrypted;
};
