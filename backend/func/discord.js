const parseName = (discord_username) => {
    return discord_username.substring(0, discord_username.length - 5)
}

const removeRole = async (discord, guild) => {
    const member = await guild.members.fetch(discord)
    if(member === undefined) {
        return false
    }
    await member.roles.remove(process.env.ROLE_ID).catch((e) => console.error()) // Throwing false error -- TODO
    console.log("Removed role from: " + discord)
    return true
}

const addRole = async (member) => {
    await member.roles.add(process.env.ROLE_ID).catch((e) => console.error()) // Throwing false error -- TODO
    console.log("Added new role for: " + member.id)
    return true
}

exports.parseName = parseName
exports.removeRole = removeRole
exports.addRole = addRole