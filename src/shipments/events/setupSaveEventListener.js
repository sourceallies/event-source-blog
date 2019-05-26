
const mongoClient = require('../../configuredMongoClient');
const kafka = require('../../configuredKafka');

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

    const _id = `${event.shipmentId}-${event.eventTimestamp}`;
    await mongoClient
        .db('shipment')
        .collection('shipment_events')
        .replaceOne(
            {_id},
            {
                ...event,
                _id
            },
            {upsert: true}
        );
}

module.exports = async function setupSaveEventListener() {
    const consumer = kafka.consumer({ groupId: 'shipment-events-persist' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'shipment-events' });
    await consumer.run({eachMessage});
};