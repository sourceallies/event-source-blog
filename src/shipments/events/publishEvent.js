
const {producer} = require('../../configuredKafka');

module.exports = async function publishEvent(event) {
    await producer.send({
        topic: 'shipment-events',
        messages: [
            { key: event.shipmentId, value: JSON.stringify(event) }
        ]
    });
};