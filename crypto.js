var CryptoJS = require('crypto-js');

const [password, secretKey] = process.argv.slice(2);

// 密码加密
const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(password), secretKey).toString();

const bytes= CryptoJS.AES.decrypt(encrypted, secretKey);
var originalText = bytes.toString(CryptoJS.enc.Utf8); 