require('dotenv').config({path:'.env.keys'});
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/completions';

// Create a new Discord client with the necessary intents
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
]});

// When the bot is ready, log a message
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// When a message is received, process it
client.on('messageCreate', async (message) => {
    // Ignore messages from the bot itself
    if (message.author.bot) return;

    try {
        // Send the message to the Anthropic API and get the response
        console.log('Sending request to Anthropic API...');
        const response = await axios.post(ANTHROPIC_API_URL, {
            prompt: message.content,
            max_tokens: 1024,
            temperature: 0.0,
            top_p: 0.9,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`
            }
        });

        // Send the response back to the Discord channel
        console.log('Sending response to Discord channel...');
        await message.channel.send(response.data.choices[0].text);
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error response from Anthropic API:', error.response.data);
            await message.channel.send(`Error: ${error.response.status} - ${error.response.data}`);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Error with the request to Anthropic API:', error.request);
            await message.channel.send(`Error: No response from Anthropic API`);
        } else {
            // Something else happened in making the request
            console.error('Error setting up the request to Anthropic API:', error.message);
            await message.channel.send(`Error: ${error.message}`);
        }
    }
});

// Start the Discord bot
console.log('Starting the Discord bot...');
client.login(process.env.DISCORD_BOT_TOKEN);