export type TimeInterval_t = 'minutes' | 'hours' | 'days';

export type Config = {
    [serverId: number]: {
        pingRole: number | undefined;
        interval: number | undefined;
        channelId: string | undefined;
        intervalId: number | undefined; // id of the interval object that sends the question
    }
}

export const COMMAND_TYPES = {
    SUB_COMMAND: 1,
    SUB_COMMAND_GROUP: 2,
    STRING: 3,
    INTEGER: 4, // Any integer between -2^53+1 and 2^53-1
    BOOLEAN: 5,
    USER: 6,
    CHANNEL: 7, // Includes all channel types + categories
    ROLE: 8,
    MENTIONABLE: 9, // Includes users and roles
    NUMBER: 10, // Any double between -2^53 and 2^53
    ATTACHMENT: 11,
} as const;