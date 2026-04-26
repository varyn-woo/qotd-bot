import 'dotenv/config';
import express, { response } from 'express';
import ngrok from '@ngrok/ngrok';
import {
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji, makeTextResult } from './utils.ts';
import { addQuestion, listQuestions, setChannel, setQuestionInterval, setPingRole, start, checkConfig } from './store.ts';
import { TimeInterval_t } from './types.ts';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
if (!process.env.PUBLIC_KEY) {
  console.error("No public key found for the bot. Exiting.");
  process.exit(1);
}

(async function () {
  const listener = await ngrok.forward({ addr: PORT, authtoken: process.env.NGROK_AUTH_TOKEN });
  console.log(`Ingress established at: ${listener.url()}`);
})();

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction id, type and data
  const { guild_id: guild, type, data } = req.body;

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
        addQuestion(guild, question);
        const queueLength = listQuestions(guild)?.length ?? 0;
        return res.send(makeTextResult(`${getRandomEmoji()} Question added. There are \`${queueLength}\` questions in the queue.`));
      case 'list':
        const questions = listQuestions(guild);
        return res.send(makeTextResult(`${getRandomEmoji()} Here are the questions currently in the queue:\n- ${questions.join('\n- ')}`));
      case 'setchannel':
        const channelId = data.options[0].value;
        setChannel(guild, channelId);
        return res.send(makeTextResult(`${getRandomEmoji()} Channel set to <#${channelId}>!`));
      case 'setinterval':
        const num = data.options[0].value;
        const unit = data.options[1].value as TimeInterval_t;
        const begin = data.options[2]?.value ?? true;
        setQuestionInterval(guild, num, unit);
        let responseMessage = `${getRandomEmoji()} Question interval set to \`${num} ${unit}\`!`;
        if (begin) {
          start(guild, true);
          responseMessage += `\n${getRandomEmoji()} Question of the day started!`;
        }
        return res.send(makeTextResult(responseMessage));
      case 'setpingrole':
        const pingRoleId = data.options[0].value;
        setPingRole(guild, pingRoleId);
        return res.send(makeTextResult(`${getRandomEmoji()} Ping role set to <@&${pingRoleId}>!`));
      case 'begin':
        const sendFirst = data.options[0]?.value ?? true;
        const { valid, errorMsg } = checkConfig(guild);
        if (!valid) {
          return res.send(makeTextResult(`⛔ ${errorMsg}`));
        }
        start(guild, sendFirst);
        return res.send(makeTextResult(`${getRandomEmoji()} Question of the day started!`));
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
