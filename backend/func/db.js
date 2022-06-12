const {MongoClient} = require("mongodb");
const {removeRole, addRole} = require("./discord");
const {checkInventory} = require("./secret");
const {encryptData, decryptData} = require("./extra");

const grabUser = async (collection, token_id) => {
    const query = {
        token_id: token_id
    }
    return await collection.findOne(query)
}

const replaceUser = async (collection, token, userData, guild, member) => {

    // Encrypted data
    const encryptedUserData = {
        discord: encryptData(userData.discord),
        address: encryptData(userData.address)
    }

    // Discord role
    const roles = await guild.roles.fetch()
    const role = roles.find((r) => r.id === process.env.ROLE_ID)

    let oldUser = await grabUser(collection, token)
    if(oldUser === null){ // Check if old user does not exist in database
        if(await countUser(collection, userData.discord) === 0){
            if(!await addRole(member, role)){
                return {
                    success: false,
                    message: "Unable to add role to the new user."
                }
            }
        }
        return await updateUser(collection, token, encryptedUserData.discord, encryptedUserData.address)
    }

    const oldDiscord = decryptData(oldUser.discord_id)

    if(oldDiscord !== userData.discord){ // Verify old discord does not match new discord
        if(await countUser(collection, oldDiscord) <= 1){ // Check if old user has no more NFTs linked to their Discord
            if(!(await removeRole(oldDiscord, guild, role))) { // Attempt to remove role from the old user
                return {
                    success: false,
                    message: "Unable to remove role from the old member."
                }
            }
        }
        if(await countUser(collection, userData.discord) === 0){
            if(!(await addRole(member, role))){
                return {
                    success: false,
                    message: "Unable to add role to the new member."
                }
            }
        }
        return await updateUser(collection, token, encryptedUserData.discord, encryptedUserData.address)
    }
    return {
        success: true,
        message: "Discord usernames are the same. No reason to update."
    }
}

const countUser = async (collection, discord_id) => {
    let count = 0

    const allDocs = await collection.find().toArray()

    for(const element of allDocs){
        const discord = decryptData(element.discord_id)
        if(discord === discord_id){
            if(count === 1){
                return 2
            }
            count += 1
        }
    }
    return count
}

const updateUser = async (collection, token_id, discord_id, address) => {
    const filter = { token_id: token_id }
    const options = { upsert: true }
    const updateDoc = {
        $set: {
            discord_id: discord_id,
            address: address
        }
    }
    let response = await collection.updateOne(filter, updateDoc, options)
    if(response.modifiedCount > 0 || response.upsertedCount > 0){
        return {
            success: true,
            message: "Successfully updated discord user for token ID: " + token_id
        }
    }
    console.log(response)
    return {
        success: false,
        message: "Failed to update the user for token: " + token_id
    }
}

const removeUser = async (collection, token_id, address) => {
    try {
        const current_address = decryptData((await grabUser(collection, token_id)).address)
        if(current_address !== address) { // Make sure the address has not been changed (linked to new owner)
            return {
                success: true,
                message: "Token ID: " + token_id + " has already been linked to a different address"
            }
        }
        const filter = {
            token_id: token_id
        }

        let response = await collection.deleteOne(filter)
        if(response.deletedCount === 1){
            return {
                success: true,
                message: "Successfully removed discord from database for token ID: " + token_id
            }
        }
        console.log(response)
        return {
            success: false,
            message: "Failed to remove the user. Token (" + token_id + ") may have already been linked to a new address."
        }
    } catch (e) {
        console.error(e)
        return {
            success: false,
            message: e.message
        }
    }

}

const checkAllTokens = async (discord_client) => {
    const mongo_client = new MongoClient(process.env.MONGO_DB_URI)
    try {
        // Database details
        await mongo_client.connect()
        const database = mongo_client.db(process.env.DB_NAME)
        const collection = database.collection(process.env.MONGO_COLLECTION_NAME)

        // Discord role
        const guild = discord_client.guilds.cache.get(process.env.SERVER_ID)
        const roles = await guild.roles.fetch()
        const role = roles.find((r) => r.id === process.env.ROLE_ID)

        // All documents in the database collection
        const allDocs = await collection.find().toArray()

        let decryptedDocs = []

        for (const doc of allDocs) { // Decrypt all documents
            decryptedDocs.push(
                {
                    token_id: doc.token_id,
                    address: decryptData(doc.address),
                    discord_id: decryptData(doc.discord_id)
                }
            )
        }

        let groupedUsers = decryptedDocs.reduce(function (r, a) { // Sort decrypted documents, group by matching address
            r[a.address] = r[a.address] || [];
            r[a.address].push(a);
            return r;
        }, {})

        // Check inventory of each secret address. Remove role if there are no tokens in the inventory.

        for (const address of Object.keys(groupedUsers)) {
            const user = groupedUsers[address]
            let discord_id = user[0].discord_id

            let tokens = user.map(a => a.token_id)

            let removeCount = 0

            let inventoryResponse = await checkInventory(address)

            if(!inventoryResponse.success){
                console.error("Unable to query secret address related to tokens: " + JSON.stringify(tokens))
                continue
            }

            let inventory = inventoryResponse.tokens

            let verifiedTokens = []

            for(const token of tokens){
                if(!inventory.includes(token)){
                    // Remove discord ID and address from database - user no longer holds the token
                    let removeResponse = await removeUser(collection, token, address)
                    console.log(removeResponse.message)
                    if(!removeResponse.success){
                        continue
                    }
                    removeCount++
                } else {
                    console.log("Verified ownership for token: " + token)
                    verifiedTokens.push(token)
                }
            }

            const new_tokens = inventory.filter(x => !verifiedTokens.includes(x))

            if(new_tokens.length > 0){ // Check if there are any new tokens not in the database
                // Update database with new tokens
                for(const token of new_tokens){
                    if(!verifiedTokens.includes(token)){
                        let updateResponse = await updateUser(collection, token, encryptData(discord_id), encryptData(address))
                        if(!updateResponse.success){
                            console.log("Database exec failed. Could not add new token: " + token)
                        }
                        console.log(updateResponse.message)
                    }
                }
            } else if(tokens.length === removeCount){
                // Remove role, user does not hold any tokens
                if(!await removeRole(discord_id, guild, role)){
                    console.log("Unable to remove role from: " + discord_id)
                }
            }
        }
        return new Date().toLocaleString() + " - All tokens have been checked!"
    } catch (e) {
        return e
    } finally {
        await mongo_client.close()
    }
}

exports.checkAllTokens = checkAllTokens
exports.grabUser = grabUser
exports.updateUser = updateUser
exports.replaceUser = replaceUser