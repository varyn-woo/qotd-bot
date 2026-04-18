import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

// Add new question
const ADD_COMMAND = {
  name: 'add',
  description: 'Add a new question',
  type: 1,
  options: [
    {
      type: 3,
      name: 'question',
      description: 'The question to add',
      required: true,
    }
  ]
};

// List all questions
const LIST_COMMAND = {
  name: 'list',
  description: 'List all questions in the queue',
  options: [],
  type: 1
};

// Set channel for where you want to send the messages
const CHANNEL_COMMAND = {
  name: 'setchannel',
  description: 'Set the channel where QOTD questions are sent',
  options: [
    {
      type: 7,
      name: 'channel',
      description: 'The channel to send QOTD questions to',
      required: true
    }
  ]
}

const INTERVAL_COMMAND = {
  name: 'setinterval',
  description: 'Set the interval for sending QOTD questions',
  options: [
    {
      type: 4,
      name: 'number',
      description: 'The number of time units',
      required: true
    },
    {
      type: 3,
      name: 'unit',
      description: 'The time unit (seconds, minutes, hours)',
      required: true,
      choices: [
        {
          name: 'minutes',
          value: 'minutes'
        },
        {
          name: 'hours',
          value: 'hours'
        },
        {
          name: 'days',
          value: 'days'
        }
      ]
    }
  ]
}

const ALL_COMMANDS = [ADD_COMMAND, LIST_COMMAND, CHANNEL_COMMAND, INTERVAL_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
