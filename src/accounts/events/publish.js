
const {producer} = require('../../configuredKafka');

//TODO: move me

module.exports = async function publishEvent(event) {
    await producer.send({
        topic: 'account-events',
        messages: [
            { key: event.accountId, value: JSON.stringify(event) }
        ]
    });
};