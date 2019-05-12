
const mongoClient = require('../../configuredMongoClient');
const kafka = require('../../configuredKafka');

async function eachMessage({ message }) {
    const event = JSON.parse(message.value);
    console.log('Got event: ', event);

    await mongoClient
        .db('shipment')
        .collection('shipment_events')
        .replaceOne({_id: event._id}, event, {upsert: true});
}

module.exports = async function setupSaveEventListener() {
    const consumer = kafka.consumer({ groupId: 'shipment-events-persist' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'shipment-events' });
    await consumer.run({eachMessage});
};