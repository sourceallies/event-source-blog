
const {producer} = require('../../configuredKafka');

module.exports = async function publishCommand(command) {
    await producer.send({
        topic: 'shipment-commands',
        messages: [
            { key: command.shipmentId, value: JSON.stringify(command) }
        ]
    });
};