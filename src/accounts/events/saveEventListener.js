
const mongoClient = require('../../configuredMongoClient');

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
            event,
            {upsert: true}
        );
}

function isDuplicateTransactionError(e) {
    return e.name === 'MongoError' && e.code === 11000;
}

async function eachMessage({ message }) {
    const event = getEventFromMessage(message);
    console.log('Got account event: ', event);

    try {
        await trySave(event);
    } catch (e) {
        if (!isDuplicateTransactionError(e)) {
            throw e;
        }
    }
}

module.exports = {
    groupId: 'account-events-persist',
    topic: 'account-events',
    eachMessage
};