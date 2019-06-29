
const mongoClient = require('../configuredMongoClient');
const publishEvent = require('./events/publish');

function getCommandFromMessage({value, timestamp}) {
    const parsedTimestamp = new Date(+timestamp);
    return {
        ...JSON.parse(value),
        timestamp: parsedTimestamp.toISOString()
    };
}

async function eachMessage({ message }) {
    const command = getCommandFromMessage(message);
    const {_id, timestamp} = command;

    const existing = await mongoClient
        .db('accounting')
        .collection('account_events')
        .findOne({_id});

    if (existing && existing.timestamp != timestamp) {
        console.log('dropping duplicate command', command);
        return;
    }

    if (!existing) {
        await mongoClient
            .db('accounting')
            .collection('account_events')
            .insertOne(command);
    }

    await publishEvent(command);
}

module.exports = {
    groupId: 'process-account-commands',
    topic: 'account-commands',
    eachMessage
};