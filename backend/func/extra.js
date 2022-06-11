const crypto = require('crypto')

const algorithm = 'aes-256-ctr'

const createEncryptionKey = () => {
    const secret = Math.random().toString(36).slice(2)
    const key = crypto.createHash('sha256').update(String(secret)).digest('base64').substr(0, 32)
    console.log(
        "\nEncryption Key: " + key  + "\n" +
        "Save this in the .env file under 'ENCRYPTION_KEY'. You must never lose this key. It is necessary for server changes & bot updates.\n"
    )
}

const encryptData = (data) => {
    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipheriv(algorithm, process.env.ENCRYPTION_KEY, iv);

    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    }
}

const decryptData = (hash) => {
    const decipher = crypto.createDecipheriv(algorithm, process.env.ENCRYPTION_KEY, Buffer.from(hash.iv, 'hex'))

    const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()])

    return decrypted.toString()
}

exports.createEncryptionKey = createEncryptionKey
exports.encryptData = encryptData
exports.decryptData = decryptData