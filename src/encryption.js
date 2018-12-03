/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
// initialisation vector for AES-CBC
function generateIV() {
  return window.crypto.getRandomValues(new Uint8Array(16));
}

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function generateNonce(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let text = '';
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// https://stackoverflow.com/questions/43131242/how-to-convert-a-hexademical-string-of-data-to-an-arraybuffer-in-javascript
function hexStringToArrayBuffer(str) {
  const typedArray = new Uint8Array(str.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)));
  return typedArray.buffer;
}
// https://stackoverflow.com/questions/40031688/javascript-arraybuffer-to-hex
function arrayBufferToHexString(buffer) {
  return Array
    .from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function wrapKey(myPublicKey, recipientPublicKey, key, $store) {
  // generate nonce string
  const nonce = generateNonce(16);

  // get shared secret (between own public and private key)
  // {fromPublicKey, toPublicKey, fromBlockchain, toBlockchain, nonce}
  const sharedSecretString = await $store.state.scatter.scatter.getEncryptionKey(myPublicKey, recipientPublicKey, 'eos', 'eos', nonce);
  const sharedSecretArrayBuffer = hexStringToArrayBuffer(sharedSecretString);
  // shared secret is 512 bit hex (Scatter takes the SHA512 hash). we need 256 bits for AES-CBC.
  const sharedSecret256ArrayBuffer = await window.crypto.subtle.digest({ name: 'SHA-256', length: 256 }, sharedSecretArrayBuffer);

  // turn the shared secret into a wrapping key
  const wrappingKey = await window.crypto.subtle.importKey('raw', sharedSecret256ArrayBuffer, { name: 'AES-CBC', length: 256 }, false, ['wrapKey']);

  // generate iv for wrapping
  const wrappingIV = generateIV();

  // convert iv to hex string for storage
  const wrappingIVString = arrayBufferToHexString(wrappingIV.buffer);

  // wrap the key
  const wrappedKeyArrayBuffer = await crypto.subtle.wrapKey('raw', key, wrappingKey, { name: 'AES-CBC', length: 256, iv: wrappingIV });

  // convert the wrapped key to a hex string for storage
  const wrappedKeyString = arrayBufferToHexString(wrappedKeyArrayBuffer);

  return {
    wrappingIVString,
    wrappedKeyArrayBuffer,
    wrappedKeyString,
    nonce,
  };
}

async function unwrapKey(ownerPublicKey, myPublicKey, nonce, wrappingIVString, wrappedKeyString, $store) {
  // get shared secret (between public and private key)
  // {fromPublicKey, toPublicKey, fromBlockchain, toBlockchain, nonce}
  const sharedSecretString = await $store.state.scatter.scatter.getEncryptionKey(myPublicKey, ownerPublicKey, 'eos', 'eos', nonce);
  const sharedSecretArrayBuffer = hexStringToArrayBuffer(sharedSecretString);
  // shared secret is 512 bit hex (Scatter takes the SHA512 hash). we need 256 bits for AES-CBC.
  const sharedSecret256ArrayBuffer = await window.crypto.subtle.digest({ name: 'SHA-256', length: 256 }, sharedSecretArrayBuffer);

  // turn the shared secret into a wrapping key
  const wrappingKey = await window.crypto.subtle.importKey('raw', sharedSecret256ArrayBuffer, { name: 'AES-CBC', length: 256 }, false, ['unwrapKey']);

  // get the wrapping iv
  const wrappingIV = new Uint8Array(hexStringToArrayBuffer(wrappingIVString));

  // get the wrapped key
  const wrappedKeyArrayBuffer = hexStringToArrayBuffer(wrappedKeyString);

  // unwrap the key
  const key = await window.crypto.subtle.unwrapKey('raw', wrappedKeyArrayBuffer, wrappingKey, { name: 'AES-CBC', length: 256, iv: wrappingIV }, { name: 'AES-CBC', length: 256 }, true, ['decrypt']);

  return key;
}

async function encrypt({ publicKey, arrayBuffer, $store }) {
  // generate key
  const key = await window.crypto.subtle.generateKey({ name: 'AES-CBC', length: 256 }, true, ['encrypt']);

  // wrap key
  const {
    wrappingIVString,
    wrappedKeyString,
    nonce,
  } = await wrapKey(publicKey, publicKey, key, $store);

  // generate iv for encryption
  const encryptionIV = generateIV();

  // convert iv to hex string for storage
  const encryptionIVString = arrayBufferToHexString(encryptionIV.buffer);

  const encrypted = await window.crypto.subtle.encrypt({ name: 'AES-CBC', iv: encryptionIV }, key, arrayBuffer);

  return {
    wrappingIVString, wrappedKeyString, nonce, encryptionIVString, encrypted,
  };
}

async function decrypt({
  arrayBuffer, encryptionIVString, nonce, wrappingIVString, wrappedKeyString, ownerPublicKey, myPublicKey, $store,
}) {
  // unwrap the key
  const key = await unwrapKey(ownerPublicKey, myPublicKey, nonce, wrappingIVString, wrappedKeyString, $store);

  // get the encryption iv
  const encryptionIV = new Uint8Array(hexStringToArrayBuffer(encryptionIVString));

  // decrypt the data
  const decryptedArrayBuffer = await window.crypto.subtle.decrypt({ name: 'AES-CBC', iv: encryptionIV }, key, arrayBuffer);
  return decryptedArrayBuffer;
}

// decrypts our key and encrypts it for the recipient
async function shareKey({
  publicKey, recipientPublicKey, $store, nonce, wrappingIVString, wrappedKeyString,
}) {
  // unwrap the key
  const key = await unwrapKey(publicKey, publicKey, nonce, wrappingIVString, wrappedKeyString, $store);

  // wrap key again using shared secret between our private key and their public key
  const wrapResult = await wrapKey(publicKey, recipientPublicKey, key, $store);
  const newWrappingIVString = wrapResult.wrappingIVString;
  const newWrappedKeyString = wrapResult.wrappedKeyString;
  const newNonce = wrapResult.nonce;

  return {
    wrappingIVString: newWrappingIVString,
    wrappedKeyString: newWrappedKeyString,
    nonce: newNonce,
  };
}
export default {
  encrypt, decrypt, shareKey,
};
