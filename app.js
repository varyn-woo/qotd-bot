import 'dotenv/config';
import express from 'express';
import https from 'https';
import {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji } from './utils.js';
import { addQuestion, listQuestions, setChannel, getChannel, dequeueQuestion } from './store.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
const QUESTION_SEND_INTERVAL = 1000 * 60 * 60 * 24; // 1 day

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction id, type and data
  const { id, type, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "add" command (adds a question)
    switch (name) {
      case 'add':
        // Send a message into the channel where command was triggered from
        const question = data.options[0].value;
        addQuestion(question);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                // Fetches a random emoji to send from a helper function
                content: `${getRandomEmoji()} Question added: \`${question}\``,
              }
            ]
          },
        });
      case 'list':
        const questions = listQuestions();
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `${getRandomEmoji()} Here are the questions currently in the queue:\n${questions.join('\n')}`,
              }
            ]
          }
        });
      case 'setchannel':
        const channelId = data.options[0].value;
        setChannel(channelId);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `${getRandomEmoji()} Channel set to <#${channelId}>!`,
              }
            ]
          }
        });
      case 'setinterval':
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

setInterval(() => {
  const channelId = getChannel();

  if (channelId) {
    // Send a QOTD message to the channel
    const question = dequeueQuestion();
    if (question) {
      const data = JSON.stringify({
        embeds: [
          {
            title: `${getRandomEmoji()} 𝙌𝙪𝙚𝙨𝙩𝙞𝙤𝙣 𝙤𝙛 𝙩𝙝𝙚 𝙙𝙖𝙮`,
            type: 'rich',
            allowed_mentions: {
              parse: ['roles']
            },
            description: `\`${question}\`\n<@&1495125973216002058>`,
            footer: {
              text: 'You can submit questions to the bot using the /add command.'
            }
          }
        ]
      });
      const options = {
        hostname: `discord.com`,
        path: `/api/channels/${channelId}/messages`,
        method: 'POST',
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res) => {
        let body = '';

        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          console.log('Response:', body);
        });
      });

      req.on('error', (error) => {
        console.error('Failed to send QOTD message:', error);
      });

      req.write(data);
      req.end();
    }
  }
}, QUESTION_SEND_INTERVAL);

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
