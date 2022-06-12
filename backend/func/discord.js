const parseName = (discord_username) => {
    return discord_username.substring(0, discord_username.length - 5)
}

const removeRole = async (discord, guild, role) => {
    try {
        const member = await guild.members.fetch(discord)
        if(member === undefined) {
            return false
        }
        const response = await member.roles.remove(role)
        if(!response._roles.includes(process.env.ROLE_ID)) {
            console.log("Removed role from: " + discord)
            return true
        }
    } catch (e) {
        console.error(e.message)
        return false
    }

}

const addRole = async (member, role) => {
    try {
        const response = await member.roles.add(role)
        if(response._roles.includes(process.env.ROLE_ID)) {
            console.log("Added role to: " + member.id)
            return true
        }
    } catch (e) {
        console.error(e.message)
        return false
    }

}

exports.parseName = parseName
exports.removeRole = removeRole
exports.addRole = addRole