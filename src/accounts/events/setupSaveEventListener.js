
const mongoClient = require('../../configuredMongoClient');
const kafka = require('../../configuredKafka');

async function eachMessage({ message }) {
    const event = JSON.parse(message.value);
    console.log('Got event: ', event);

    await mongoClient
        .db('accounting')
        .collection('account_events')
        .replaceOne({_id: event._id}, event, {upsert: true});
}

module.exports = async function setupSaveEventListener() {
    const consumer = kafka.consumer({ groupId: 'account-events-persist' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'account-events' });
    await consumer.run({eachMessage});
};