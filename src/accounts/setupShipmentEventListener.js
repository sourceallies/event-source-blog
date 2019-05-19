
const kafka = require('../configuredKafka');
const publishEvent = require('./events/publishEvent');

async function publishInvoiceEvent(shipmentEvent) {
    const eventTimestamp = new Date(Date.now()).toISOString();
    const invoiceEvent = {
        _id: `${shipmentEvent._id}-invoice`,
        accountId: 'TODO', //TODO: how do we get this value?
        eventTimestamp,
        eventType: 'shipment-invoice',
        amount: -1 * 0, //TODO: how do we get this value?
        shipmentId: shipmentEvent.shipmentId
    };
    await publishEvent(invoiceEvent);
}

function isDeliverEvent(event) {
    return event.eventType === 'deliver';
}

async function eachMessage({ message }) {
    const event = JSON.parse(message.value);

    if (isDeliverEvent(event)) {
        await publishInvoiceEvent(event);
    }
}

module.exports = async function setupShipmentEventListener() {
    const consumer = kafka.consumer({ groupId: 'accounts-shipment-events' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'shipment-events' });
    await consumer.run({eachMessage});
};