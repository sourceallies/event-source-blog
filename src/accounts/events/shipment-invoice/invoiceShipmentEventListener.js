
const publishEvent = require('../publishEvent');
const loadShipment = require('../../../shipments/loadShipment');

async function publishInvoiceEvent(shipmentEvent) {
    const {shipmentId} = shipmentEvent;
    const {billToAccountId, cost} = await loadShipment(shipmentId);
    const invoiceEvent = {
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

module.exports = {
    groupId: 'accounts-shipment-events',
    topic: 'shipment-events',
    eachMessage
};