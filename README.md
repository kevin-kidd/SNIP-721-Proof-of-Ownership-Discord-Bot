# SNIP-721 Proof-of-Ownership Discord Bot

A proof-of-ownership Discord bot for SNIP-721 tokens on the Secret Network. Verified owners are given specified roles. In addition, there is a cron script included which will continuously check ownership of all the Discord members and remove users that no longer hold any tokens.

### Requirements
1. MongoDB (recommend [Atlas](https://www.mongodb.com/atlas))
2. Discord bot [token](https://docs.discordbotstudio.org/setting-up-dbs/finding-your-bot-token)
3. Discord [Server ID](https://www.alphr.com/discord-find-server-id/)
4. Discord [Role ID](https://i.imgur.com/OtihPLv.png)

### Back-end Instructions
- Edit the `.env` file in the backend directory.
- Fill in the details for your Discord server ID, role ID and token at the top.
- Fill in the contract address and code hash for your SNIP-721 contract.
- Create a new wallet, fund it with some SCRT for gas and input the mnemonic inside the `.env` file.
- Enter your Mongo DB details at the bottom of the file.

Next, we will generate a viewing key. Open your terminal, head to the backend directory and enter:
```angular2html
yarn run --set-viewing-key
```
This will output a viewing key, save this to the `.env` file.

Next, we will generate an encryption key that will be used for encrypting the secret address and discord ID's saved in the database.
```angular2html
yarn run --create-encryption-key
```
Copy the encryption key from the output and save it in the `.env` file.

Now, you are ready to start the bot!
Note: The bot will run on port 4000, you can change this in `bot.js` if you need.

Start the bot:
```angular2html
node bot.js
```

To start the cron job:
```angular2html
node cron.js
```

### Front-end Instructions
- Edit the `config.js` file in the frontend directory
- Fill in the details for your SNIP-721 contract
- Fill in the Secret address for the new wallet you created to use with the backend
- Finally, you will need to include the URL for the backend API running on port 4000
  - For example, you would enter http://localhost:4000 if you are running this from your local machine

Now you are ready to deploy the website! Save the config file, build and deploy to your web server.
