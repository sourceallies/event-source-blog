
const mongoClient = require('../../configuredMongoClient');

function getEventFromMessage({value, timestamp}) {
    const eventTimestamp = new Date(+timestamp).toISOString();
    return {
        ...JSON.parse(value),
        eventTimestamp
    };
}

async function eachMessage({ message }) {
    const event = getEventFromMessage(message);
    const _id = `${event.accountId}-${event.eventTimestamp}`;
    console.log('Got event: ', event);

    await mongoClient
        .db('accounting')
        .collection('account_events')
        .replaceOne(
            {_id},
            {
                ...event,
                _id
            },
            {upsert: true}
        );
}

module.exports = {
    groupId: 'account-events-persist',
    topic: 'account-events',
    eachMessage
};