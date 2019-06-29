
const {producer} = require('../../configuredKafka');

module.exports = async function publishEvent(command) {
    await producer.send({
        topic: 'account-commands',
        messages: [
            { key: command.accountId, value: JSON.stringify(command) }
        ]
    });
};