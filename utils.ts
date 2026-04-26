import 'dotenv/config';
import https from 'https';
import { dequeueQuestion, getChannel, getPingRole } from './store.ts';
import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';

export async function DiscordRequest(endpoint: string, options: any) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    ...options
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function InstallGlobalCommands(appId: string, commands: any) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    const response = await DiscordRequest(endpoint, { method: 'PUT', body: commands });
    console.log(response);
  } catch (err) {
    console.error(err);
  }
}

export async function sendQotd(serverId: number) {
  const channelId = getChannel(serverId);

  if (channelId) {
    // Send a QOTD message to the channel
    const question = dequeueQuestion(serverId);
    if (question) {
      const data = {
        embeds: [
          {
            title: `${getRandomEmoji()} 𝙌𝙪𝙚𝙨𝙩𝙞𝙤𝙣 𝙤𝙛 𝙩𝙝𝙚 𝙙𝙖𝙮`,
            type: 'rich',
            description: `\`${question}\``,
            footer: {
              text: 'You can submit questions to the bot using the /add command.'
            }
          }
        ]

      };

      const pingRoleId = getPingRole(serverId);
      if (pingRoleId) {
        const pingMessage = {
          content: `<@&${getPingRole(serverId)}>`
        };
        try {
          await DiscordRequest(`channels/${channelId}/messages`, {
            method: 'POST',
            body: pingMessage
          });
        } catch (error) {
          console.error('Failed to send ping message:', error);
          return;
        }
      }
      try {
        await DiscordRequest(`channels/${channelId}/messages`, {
          method: 'POST',
          body: data
        });
      } catch (error) {
        console.error('Failed to send QOTD message:', error);
        return;
      }
    }
  }
}

export function makeTextResult(message: string) {
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
        {
          type: MessageComponentTypes.TEXT_DISPLAY,
          // Fetches a random emoji to send from a helper function
          content: message,
        }
      ]
    },
  }
}

// Simple method that returns a random emoji from list
export function getRandomEmoji() {
  const emojiList = ['😭', '😄', '😌', '🤓', '😎', '😤', '🤖', '😶‍🌫️', '🌏', '📸', '💿', '👋', '🌊', '✨'];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
