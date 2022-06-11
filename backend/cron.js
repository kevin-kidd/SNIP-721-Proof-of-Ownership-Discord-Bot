const cron = require('node-cron');

const {Intents, Client} = require("discord.js");
const {checkAllTokens} = require("./func/db");

// Discord client & server details
let intents = new Intents(Intents.NON_PRIVILEGED);
intents.add('GUILD_MEMBERS');

let discord_client = new Client({ intents: intents });

discord_client.once('ready', async () => {
    console.log('Ready!');
})

cron.schedule(
    '* * * * *',
    () => {
        console.log(new Date().toLocaleString() + " - Checking all tokens...")
        checkAllTokens(discord_client).then((response) => console.log(response))
    }
)

discord_client.login(process.env.DISCORD_TOKEN).then(() => console.log("Discord Bot connected!"))