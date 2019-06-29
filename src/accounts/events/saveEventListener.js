
const mongoClient = require('../../configuredMongoClient');
const publishEvent = require('./publishEvent');

function getEventFromMessage({value, timestamp}) {
    const eventTimestamp = new Date(+timestamp).toISOString();
    return {
        ...JSON.parse(value),
        eventTimestamp
    };
}

async function trySave(event) {
    const {_id, eventTimestamp} = event;
    await mongoClient
        .db('accounting')
        .collection('account_events')
        .replaceOne(
            {
                _id,
                eventTimestamp
            },
            {
                ...event,
                _id
            },
            {upsert: true}
        );
}

function isDuplicateTransactionError(e) {
    return e.name === 'MongoError' && e.code === 11000;
}

async function tombstoneEvent(event) {
    const eventTimestamp = new Date(Date.now()).toISOString();
    const tombstone = {
        accountId: event.accountId,
        eventTimestamp,
        eventType: 'tombstone',
        reversedEvent: event
    };
    await publishEvent(tombstone);
}

async function eachMessage({ message }) {
    const event = getEventFromMessage(message);
    console.log('Got event: ', event);
    if (event.eventType === 'tombstone') {
        return;
    }

    try {
        await trySave(event);
    } catch (e) {
        if (isDuplicateTransactionError(e)) {
            tombstoneEvent(event);
        } else {
            throw e;
        }
    }
}

module.exports = {
    groupId: 'account-events-persist',
    topic: 'account-events',
    eachMessage
};