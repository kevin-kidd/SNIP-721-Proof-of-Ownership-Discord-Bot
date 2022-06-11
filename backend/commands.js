const {setKey} = require("./func/secret");
const {createEncryptionKey} = require("./func/extra");

const args = process.argv.slice(2)
if (args.length === 0) {
    console.log("No arguments provided. Expected --set-viewing-key or --create-encryption-key")
} else if(args.length === 1 && args[0] === "--set-viewing-key"){
    setKey()
} else if(args.length === 1 && args[0] === "--create-encryption-key"){
    createEncryptionKey()
} else {
    console.error("Incorrect arguments provided. Expected --set-viewing-key or --create-encryption-key")
}