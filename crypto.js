import CryptoJS from 'crypto-js';

// 加密
export const encrypt = (password, secretKey) =>
  CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(password), secretKey).toString();

// 解密
export const decrypt = (password, secretKey) => {
  const bytes = CryptoJS.AES.decrypt(password, secretKey);

  return bytes.toString(CryptoJS.enc.Utf8);
};
