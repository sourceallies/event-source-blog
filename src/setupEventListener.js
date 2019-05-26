
const kafka = require('../configuredKafka');

module.exports = async function setupEventListener({groupId, topic, eachMessage}) {
    const consumer = kafka.consumer({ groupId });
    await consumer.connect();
    await consumer.subscribe({ topic });
    await consumer.run({eachMessage});
};