
const kafka = require('../configuredKafka');
const publishEvent = require('./events/publishEvent');
const loadShipment = require('../shipments/loadShipment');

async function publishInvoiceEvent(shipmentEvent) {
    const {shipmentId} = shipmentEvent;
    const {billToAccountId, cost} = await loadShipment(shipmentId);
    const invoiceEvent = {
        _id: `${shipmentId}-invoice`,
        accountId: billToAccountId,
        eventType: 'shipment-invoice',
        amount: -1 * cost,
        shipmentId,
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