const {toUtf8, fromBase64} = require("@cosmjs/encoding");
const {bech32} = require("bech32");
const {ripemd160} = require("@noble/hashes/ripemd160");
const {sha256} = require("@noble/hashes/sha256");
const secp256k1 = require("@noble/secp256k1");

const sortedObject = (obj) => {
    if (typeof obj !== "object" || obj === null) {
        return obj
    }
    if (Array.isArray(obj)) {
        return obj.map(sortedObject)
    }
    const sortedKeys = Object.keys(obj).sort()
    const result= {};
    sortedKeys.forEach((key) => {
        result[key] = sortedObject(obj[key])
    });
    return result;
}


const JsonSortedStringify = (obj) => {
    return JSON.stringify(sortedObject(obj))
}

const serializeStdSignDoc = (signDoc) => {
    return toUtf8(JsonSortedStringify(signDoc))
}

const checkSignature = async(permit, address) => {
    // Check signature address matches sending address
    const signature = permit.signature.signature
    const pubkey = permit.signature.pub_key.value
    const signed = permit.signed

    const derivedAddress = bech32.encode("secret", bech32.toWords(ripemd160(sha256(fromBase64(pubkey)))))

    if(address !== derivedAddress){
        return false
    }

    try {
        const messageHash = sha256(serializeStdSignDoc(signed))

        const sig = secp256k1.Signature.fromCompact(
            fromBase64(signature),
        )

        return secp256k1.verify(
            sig,
            messageHash,
            fromBase64(pubkey),
        )
    } catch (e) {
        console.error(e)
        return false
    }
}

exports.checkSignature = checkSignature