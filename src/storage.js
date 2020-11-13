//const base58 = require("bs58");
// @flow
import bs58 from 'bs58'
import nacl from 'tweetnacl'
import pbkdf2 from 'pbkdf2';

export async function addAccount(publicKey) {
    const name ='SOLMate-Accounts'
    const txt = localStorage.getItem(name);
    console.log("txt:", txt)
    let accounts = new Array()
    accounts.push(publicKey)
    if (txt) {
        const jsonTxt= JSON.parse(txt)
        console.log("jsonTxt:", jsonTxt) 
        let old= new Set(jsonTxt)
        old.delete(publicKey)
        accounts.push(...old)
    }
    console.log("accounts:", accounts)
    localStorage.setItem(
        name,
        JSON.stringify(accounts),
    ) 
}

export async function deleteAccount(publicKey) {
    const name ='SOLMate-Accounts'
    const txt = localStorage.getItem(name);
    if (! txt) {
        return  null;
    }
    let old = JSON.parse(txt);    
    old.delete(publicKey);
    const accounts = [...old];
    localStorage.setItem(
        name,
        JSON.stringify(accounts),
    ); 
}

export async function listAccounts() {
    const name ='SOLMate-Accounts'
    const txt = localStorage.getItem(name);
    console.log("txt:", txt);
    if (! txt) {
        return  null;
    }
    const accounts= JSON.parse(txt);    
    return accounts;
}

export async function storeSecretKey(publicKey, secretKey, password) {
    const plaintext = JSON.stringify({'secretKey':bs58.encode(secretKey)});
    const salt = nacl.randomBytes(16);
    const kdf = 'pbkdf2';
    const iterations = 100000;
    const digest = 'sha256';
    const key = await deriveEncryptionKey(password, new Buffer(salt), iterations, digest);
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const encrypted = nacl.secretbox(Buffer.from(plaintext), nonce, key);
    const name ='SOLMate-' + publicKey;
    localStorage.setItem(
        name,
        JSON.stringify({
            encrypted: bs58.encode(encrypted),
            nonce: bs58.encode(nonce),
            kdf,
            salt: bs58.encode(salt),
            iterations,
            digest,
        }),
    );
}

export async function loadSecretKey(publicKey, password) {
    const name ='SOLMate-' + publicKey;
    const txt = localStorage.getItem(name);
    if (! txt) {
        return  null;
    }
    const jsonTxt= JSON.parse(txt);
    const encrypted = bs58.decode(jsonTxt.encrypted);
    const nonce = bs58.decode(jsonTxt.nonce);
    const salt = bs58.decode(jsonTxt.salt);
    const key = await deriveEncryptionKey(password, salt, jsonTxt.iterations, jsonTxt.digest);
    const plaintext = nacl.secretbox.open(encrypted, nonce, key);
    if (!plaintext) {
      throw new Error('Incorrect password');
    }
    const decodedPlaintext = Buffer.from(plaintext).toString();
    const secretKey= JSON.parse(decodedPlaintext);
    console.log("secretKeys:", secretKey)
    return bs58.decode(secretKey.secretKey)
}

async function deriveEncryptionKey(password, salt, iterations, digest) {
    return new Promise((resolve, reject) =>
      pbkdf2.pbkdf2(
        password,
        salt,
        iterations,
        nacl.secretbox.keyLength,
        digest,
        (err, key) => (err ? reject(err) : resolve(key)),
      ),
    );
  }