const crypto = require('crypto');

const algorithm = 'aes-256-ctr';

let key = process.env.TOKEN_ENCRYPTION_KEY;

key = crypto.createHash('sha256').update(String(key)).digest('base64').substr(0,32);

export const encrypt = (buffer) =>{

    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);

    const result = Buffer.concat([iv,cipher.update(buffer), cipher.final()]);

    return result;
}

export const decrypt = (encrypted) => {

    const iv = encrypted.slice(0, 16);

    encrypted = encrypted.slice(16);

    const decipher = crypto.createDecipheriv(algorithm,key,iv);

    const result = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return result;
}

