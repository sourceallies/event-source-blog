
const publishEvent = require('../publishEvent');
const loadShipment = require('../../../shipments/loadShipment');

async function buildInvoiceEvent(shipmentEvent) {
    const {shipmentId, _id} = shipmentEvent;
    const {billToAccountId, cost} = await loadShipment(shipmentId);
    return {
        _id: `inv:${_id}`,
        accountId: billToAccountId,
        eventType: 'shipment-invoice',
        amount: -1 * cost,
        shipmentId,
    };
}

async function buildRefundEvent(shipmentEvent) {
    const {shipmentId, reversedEvent} = shipmentEvent;
    const {billToAccountId, cost} = await loadShipment(shipmentId);
    return {
        _id: `refund:${reversedEvent._id}`,
        accountId: billToAccountId,
        eventType: 'refund',
        amount: cost,
        shipmentId,
    };
}

function isDeliverEvent(event) {
    return event.eventType === 'deliver';
}

async function eachMessage({ message }) {
    const event = JSON.parse(message.value);

    if (isDeliverEvent(event)) {
        const invoiceEvent = await buildInvoiceEvent(event);
        console.log('broadcasting account event: ', invoiceEvent);
        await publishEvent(invoiceEvent);
    }
    if (event.eventType === 'tombstone') {
        if(isDeliverEvent(event.reversedEvent)) {
            const refundEvent = await buildRefundEvent(event);
            console.log('refunding account event: ', refundEvent);
            await publishEvent(refundEvent);
        }
    }
}

module.exports = {
    groupId: 'accounts-shipment-events',
    topic: 'shipment-events',
    eachMessage
};