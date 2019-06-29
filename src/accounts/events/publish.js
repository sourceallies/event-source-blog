
const {producer} = require('../../configuredKafka');

module.exports = async function publishEvent(event) {
    await producer.send({
        topic: 'account-events',
        messages: [
            { key: event.accountId, value: JSON.stringify(event) }
        ]
    });
};