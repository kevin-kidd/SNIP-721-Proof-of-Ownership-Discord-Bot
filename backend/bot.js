const dotenv = require('dotenv')
const { Client, Intents } = require('discord.js');
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const {MongoClient} = require("mongodb");
const {replaceUser} = require("./func/db");
const {checkSignature} = require("./func/signature");
const {checkInventory} = require("./func/secret");
dotenv.config()

const api = express()
const port = 4000

api.use(cors())
api.use(bodyParser.urlencoded({ extended: false }));
api.use(bodyParser.json());

// Discord client & server details
const intents = new Intents(Intents.NON_PRIVILEGED);
intents.add('GUILD_MEMBERS');

const discord_client = new Client({ intents: intents });

discord_client.once('ready', async () => {
    console.log('Ready!');
})

api.post('/add_discord', async(req, res) => {


    const mongo_client = new MongoClient(process.env.MONGO_DB_URI)

    try {
        // Database connection
        await mongo_client.connect()
        const database = mongo_client.db(process.env.DB_NAME)
        const collection = database.collection(process.env.MONGO_COLLECTION_NAME)

        // Get User ID
        const guild = discord_client.guilds.cache.get(process.env.SERVER_ID)
        const members = await guild.members.fetch()
        const member = members.find((m) => m.user.tag === req.body.discord)
        if(member === undefined) {
            res.status(500).send("Discord username is not correct or you have not joined the server!")
            return
        }

        // Non-encrypted data
        const userData = {
            discord: member.id,
            address: req.body.address
        }


        console.log("Discord ID: " + userData.discord)
        console.log("Address: " + userData.address)

        const inventoryResponse = await checkInventory(userData.address)
        const inventory = inventoryResponse.tokens
        if(inventory.length === 0 && inventoryResponse.success){
            res.status(500).send("Inventory is empty. User does not hold any NFTs or the whitelisted approval transaction was unsuccessful.")
            return
        }
        if(!inventoryResponse.success){
            res.status(500).send("Failed to query inventory. Try again.")
            return
        }

        if(!await checkSignature(req.body.signature, userData.address)){
            res.status(500).send("Incorrect permit or mismatching address.")
            return
        }
        console.log("Permit verified.")
        for (const token of inventory) {
            let response = await replaceUser(collection, token, userData, guild, member)
            if (response.success) {
                console.log(response.message)
            } else {
                console.error(response.message)
                res.status(500).send("Unable to add Discord role. Please contact an admin to resolve.")
                return
            }
        }
        res.status(200).send("Successful!")
    } catch (e) {
        console.log(e.message)
        res.status(500).send("Unable to verify ownership. Please contact an admin to resolve.")
    } finally {
        await mongo_client.close()
    }
})

discord_client.login(process.env.DISCORD_TOKEN).then(() => console.log("Discord Bot connected!"))

api.listen(port, () => console.log("Server running on port " + port))
