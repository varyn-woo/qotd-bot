import fs from 'fs';
import path from 'path';
export function addQuestion(question) {
    // Add the question to the database or in-memory store
    const file = path.join('assets', 'questions.txt');

    try {
        fs.appendFileSync(file, question + '\n', 'utf8');
    } catch (err) {
        console.error('Failed to append question:', err);
    }
}

export function listQuestions() {
    // Return the list of questions from the database or in-memory store
    const file = path.join('assets', 'questions.txt');

    try {
        const data = fs.readFileSync(file, 'utf8');
        return data.split('\n').filter(Boolean);
    } catch (err) {
        console.error('Failed to read questions:', err);
        return [];
    }
}

export function dequeueQuestion() {
    const questions = listQuestions();
    if (questions.length > 0) {
        const question = questions[0];
        const file = path.join('assets', 'questions.txt');
        try {
            fs.writeFileSync(file, questions.slice(1).join('\n'), 'utf8');
            return question;
        } catch (err) {
            console.error('Failed to dequeue question:', err);
        }
    }
    return null;
}

export function setChannel(channelId) {
    // Set the channel ID where QOTD questions will be sent
    const file = path.join('assets', 'config.json');
    const config = getConfig();

    try {
        fs.writeFileSync(file, JSON.stringify({ ...config, channelId }), 'utf8');
    } catch (err) {
        console.error('Failed to set channel:', err);
    }
}

export function getChannel() {
    const config = getConfig();
    return config ? config.channelId : null;
}

// expects interval in milliseconds
export function setInterval(interval) {
    // Set the interval for sending QOTD questions
    const file = path.join('assets', 'config.json');
    const config = getConfig();

    try {
        fs.writeFileSync(file, JSON.stringify({ ...config, interval }), 'utf8');
    } catch (err) {
        console.error('Failed to set interval:', err);
    }
}

export function getInterval() {
    const config = getConfig();
    return config ? config.interval : null;
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