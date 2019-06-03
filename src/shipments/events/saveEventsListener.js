
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
    console.log('Got event: ', event);
    const _id = event._id;

    await mongoClient
        .db('shipment')
        .collection('shipment_events')
        .replaceOne(
            {_id},
            event,
            {upsert: true}
        );
}

module.exports = {
    groupId: 'shipment-events-persist',
    topic: 'shipment-events',
    eachMessage
};