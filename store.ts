import fs from 'fs';
import path from 'path';
import { type TimeInterval_t } from './types.ts';
import { sendQotd } from './utils.ts';

const DEFAULT_QUESTION_INTERVAL = 1000 * 60 * 60 * 24; // 24 hours
const INTERVALS: Record<number, any> = {
};

export function addQuestion(serverId: number, question: string) {
    // Add the question to the database or in-memory store
    const file = path.join('assets', 'questions.json');
    const questions = getAllQuestions() ?? {};
    if (!questions[serverId]) {
        questions[serverId] = [];
    }
    questions[serverId].push(question);

    try {
        fs.writeFileSync(file, JSON.stringify(questions), 'utf8');
    } catch (err) {
        console.error('Failed to append question:', err);
    }
}

export function listQuestions(serverId: number) {
    const questions = getAllQuestions();
    if (questions) {
        return questions[serverId];
    }
}

function getAllQuestions() {
    const file = path.join('assets', 'questions.json');

    try {
        const data = fs.readFileSync(file, 'utf8');
        if (data.length == 0) return null;
        return JSON.parse(data);
    } catch (err) {
        console.error('Failed to get config:', err);
        return null;
    }
}

export function dequeueQuestion(serverId: number) {
    const questions = getAllQuestions();
    const serverQuestions = questions[serverId];
    if (serverQuestions && serverQuestions.length > 0) {
        const question = serverQuestions[0];
        const file = path.join('assets', 'questions.json');
        questions[serverId] = serverQuestions.slice(1);
        try {
            fs.writeFileSync(file, JSON.stringify(questions), 'utf8');
            return question;
        } catch (err) {
            console.error('Failed to dequeue question:', err);
        }
    }
    return null;
}

export function setChannel(serverId: number, channelId: number) {
    // Set the channel ID where QOTD questions will be sent
    const file = path.join('assets', 'config.json');
    const config = getConfig() ?? {
        [serverId]: { channelId: channelId }
    };
    config[serverId].channelId = channelId;

    try {
        fs.writeFileSync(file, JSON.stringify(config), 'utf8');
    } catch (err) {
        console.error('Failed to set channel:', err);
    }
}

export function getChannel(serverId: number) {
    const config = getConfig();
    return config ? config[serverId].channelId : null;
}

// expects interval in milliseconds
export function setQuestionInterval(serverId: number, count: number, unit: TimeInterval_t) {
    // Set the interval for sending QOTD questions
    const file = path.join('assets', 'config.json');
    const config = getConfig();
    let scaleFactor = DEFAULT_QUESTION_INTERVAL; // default to 1 day unit
    switch (unit) {
        case 'hours':
            scaleFactor = 1000 * 60 * 60;
        case 'minutes':
            scaleFactor = 1000 * 60;
    }
    config[serverId].interval = count * scaleFactor;

    try {
        fs.writeFileSync(file, JSON.stringify(config), 'utf8');
    } catch (err) {
        console.error('Failed to set interval:', err);
    }
}

export function start(serverId: number, sendFirst: boolean): void {
    const config = getConfig();
    if (!config || !config[serverId] || !config[serverId].channelId) {
        console.error("Not configured properly.");
        return;
    }
    // reset old interval and make new one
    if (INTERVALS[serverId]) {
        clearInterval(INTERVALS[serverId]);
    }
    const interval = getQuestionInterval(serverId)
    INTERVALS[serverId] = setInterval(sendQotd, interval, serverId);
    // send the first question
    if (sendFirst) {
        sendQotd(serverId);
    }
}

export function checkConfig(serverId: number): { valid: boolean, errorMsg: string | null } {
    const config = getConfig();
    if (!config || !config[serverId] || !config[serverId].channelId) {
        return { valid: false, errorMsg: "Please use `setChannel` to select a destination channel for your questions before starting." };
    }
    return { valid: true, errorMsg: null };
}

export function getQuestionInterval(serverId: number) {
    const config = getConfig();
    return config ? config[serverId].interval : DEFAULT_QUESTION_INTERVAL;
}

function getConfig() {
    const file = path.join('assets', 'config.json');

    try {
        const data = fs.readFileSync(file, 'utf8');
        if (data.length == 0) return null;
        return JSON.parse(data);
    } catch (err) {
        console.error('Failed to get config:', err);
        return null;
    }
}

export function getPingRole(serverId: number) {
    const config = getConfig();
    return config ? config[serverId].pingRole : null;
}

export function setPingRole(serverId: number, roleId: number) {
    const config = getConfig() ?? {
        [serverId]: { pingRole: roleId }
    };
    config[serverId].pingRole = roleId;
    const file = path.join('assets', 'config.json');
    try {
        fs.writeFileSync(file, JSON.stringify(config), 'utf8');
    } catch (err) {
        console.error('Failed to set ping role:', err);
    }
}