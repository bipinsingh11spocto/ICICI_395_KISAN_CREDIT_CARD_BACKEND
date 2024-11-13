require("dotenv").config();
const CryptoJS = require("crypto-js");
const crypto = require('crypto');

const algorithm = process.env.CRYPTO_ALGO;
const secretKey = process.env.CRYPTO_SECRET_KEY;
const iv = process.env.CRYPTO_SECRET_IV;

const encryptLink = (text) => {
    const cipher = crypto.createCipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'));
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return encrypted.toString('hex');
};
const decryptlink = (hash) => {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'));
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);
    return decrpyted.toString();
};


function encrypt(text) {
    let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(text), secretKey).toString();
    return (ciphertext);
}

function decrypt(hash) {
    let decryptedData = JSON.parse(CryptoJS.AES.decrypt(hash, secretKey).toString(CryptoJS.enc.Utf8));
    return (decryptedData);
}

function generateHMACKey(dataToSign) {
    // Create an HMAC using SHA-256 algorithm and the SECRET
    const hmac = crypto.createHmac('sha256', process.env.HMAC_SECRET);
    hmac.update(dataToSign); // Update the HMAC with the data to sign
    const signature = hmac.digest('hex');
    return signature;
}

module.exports = {
    encrypt,
    decrypt,
    encryptLink,
    decryptlink,
    generateHMACKey
}