const dotenv = require('dotenv')
const {Wallet, SecretNetworkClient} = require("secretjs")
dotenv.config()

const checkInventory = async (address) => {
    try {
        let client = await getClient()
        let response = await client.query.compute.queryContract({
            contractAddress: process.env.SNIP721_ADDRESS,
            codeHash: process.env.SNIP721_CODE_HASH,
            query: {
                tokens: {
                    owner: address,
                    viewer: client.address,
                    viewing_key: process.env.VIEWING_KEY,
                    limit: 50
                }
            }
        })
        if(response.generic_err !== undefined){
            console.error("Invalid viewing key! Change the viewing key in the .env file.")
            return {
                success: false,
                tokens: []
            }
        }
        return {
            success: true,
            tokens: response.token_list.tokens
        }
    } catch (e) {
        console.log(e.message)
        return {
            success: false,
            tokens: []
        }
    }
}

const getClient = async () => {
    try {
        const wallet = new Wallet(process.env.MNEMONIC)
        return await SecretNetworkClient.create({
            grpcWebUrl: process.env.GRPC_URL,
            chainId: process.env.CHAIN_ID,
            wallet: wallet,
            walletAddress: wallet.address,
        })
    } catch (e) {
        console.error("Failed to get client.")
        console.error(e)
    }
}

const setKey = async () => {
    const key = Math.random().toString(36).substr(2, 25)
    const client = await getClient()
    const viewingKeyTx = await client.tx.compute.executeContract(
        {
            sender: client.address,
            contractAddress: process.env.SNIP721_ADDRESS,
            codeHash: process.env.SNIP721_CODE_HASH,
            msg: {
                set_viewing_key: {
                    key: key
                }
            },
        },
        { gasLimit: 1_000_000 }
    )
    if(viewingKeyTx.code !== 0){
        console.error(viewingKeyTx)
        console.error("Unable to set viewing key!")
    }
    console.log(
        "\nSuccessfully set new viewing key: " + key + "\n" +
        "Please add this key in the .env file.\n"
    )
}

exports.setKey = setKey
exports.checkInventory = checkInventory