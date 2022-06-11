import {SecretNetworkClient} from "secretjs";
import {SCRT_CHAIN_ID, SCRT_GRPC_URL} from "../config";

const getAddress = async () => {
    const keplrOfflineSigner = window.getOfflineSignerOnlyAmino(SCRT_CHAIN_ID);
    const [{ address: myAddress }] = await keplrOfflineSigner.getAccounts()
    return myAddress
}

export const getClient = async () => {
    try {
        await window.keplr.enable(SCRT_CHAIN_ID)
        const myAddress = await getAddress()

        if (localStorage.getItem('signature') === null || localStorage.getItem('address') !== myAddress) {
            await getSignature()
            localStorage.setItem('address', myAddress)
        }

        return await SecretNetworkClient.create({
            grpcWebUrl: SCRT_GRPC_URL,
            chainId: SCRT_CHAIN_ID,
            wallet: window.getOfflineSignerOnlyAmino(SCRT_CHAIN_ID),
            walletAddress: myAddress,
            encryptionUtils: window.getEnigmaUtils(SCRT_CHAIN_ID),
        })
    } catch (e) {
        console.error(e.message)
        return undefined
    }


}

export const getSignature = async () => {
    const myAddress = await getAddress()

    const permit = await window.keplr.signAmino(
        SCRT_CHAIN_ID,
        myAddress,
        {
            chain_id: SCRT_CHAIN_ID,
            account_number: "0",
            sequence: "0",
            fee: {
                amount: [{ denom: "uscrt", amount: "0" }],
                gas: "1",
            },
            msgs: [
                {
                    type: "link-discord",
                    value: "This is a signature request. Accepting this request will allow our Discord bot to verify ownership of your wallet. " +
                        "In addition, you will need to accept a transaction that enables our Discord bot to view all of the NFTs in your inventory. " +
                        "Please note: The token IDs of your NFTs, Discord username and Secret address wil be stored in our database."
                },
            ],
            memo: "Created by @KevinAKidd :)",
        },
        {
            preferNoSetFee: true, // Fee must be 0, so hide it from the user
            preferNoSetMemo: false,
        }
    )

    localStorage.setItem('signature', JSON.stringify(permit))
    return permit
}