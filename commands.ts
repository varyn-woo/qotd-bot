import 'dotenv/config';
import { InstallGlobalCommands } from './utils.ts';
import { COMMAND_TYPES } from './types.ts';

// Add new question
const ADD_COMMAND = {
  name: 'add',
  description: 'Add a new question',
  type: 1,
  options: [
    {
      type: COMMAND_TYPES.STRING,
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
      type: COMMAND_TYPES.CHANNEL,
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
      type: COMMAND_TYPES.INTEGER,
      name: 'number',
      description: 'The number of time units',
      required: true
    },
    {
      type: COMMAND_TYPES.STRING,
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
    },
    {
      type: COMMAND_TYPES.BOOLEAN,
      name: 'begin_now',
      description: 'Start sending QOTDs now',
      required: false
    }
  ]
}

const PING_COMMAND = {
  name: 'setpingrole',
  description: 'Set a role to be pinged when the QOTD sends',
  options: [
    {
      type: COMMAND_TYPES.ROLE,
      name: 'role',
      description: 'The role that should be pinged',
      required: true
    }
  ]
}

const START_COMMAND = {
  name: 'begin',
  description: 'Start the QOTDs',
  options: [
    {
      type: COMMAND_TYPES.BOOLEAN,
      name: 'begin_now',
      description: 'Start sending QOTDs now',
      required: false
    }
  ],
  type: 1
};

const ALL_COMMANDS = [ADD_COMMAND, LIST_COMMAND, CHANNEL_COMMAND, INTERVAL_COMMAND, PING_COMMAND, START_COMMAND];

if (!process.env.APP_ID) {
  console.error('APP_ID environment variable is required to install commands');
  process.exit(1);
}
InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
