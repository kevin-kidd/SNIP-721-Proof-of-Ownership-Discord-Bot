import {MsgExecuteContract} from "secretjs";
import {BACKEND_ADDRESS, SNIP721_CODE_HASH, SNIP721_CONTRACT_ADDRESS} from "../config";

export const setWhitelist = async (client) => {
    const whitelistTx = new MsgExecuteContract({
            sender: client.address,
            contractAddress: SNIP721_CONTRACT_ADDRESS,
            codeHash: SNIP721_CODE_HASH,
            msg: {
                set_whitelisted_approval: {
                    address: BACKEND_ADDRESS,
                    view_owner: "all"
                }
            }
        })
    let response = await client.tx.broadcast([whitelistTx],
        {
            gasLimit: 150_000
        }
    )
    if(response.code === 0){
        return response
    } else {
        return undefined
    }
}