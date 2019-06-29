
const publish = require('./commands/publish');
const loadShipment = require('../shipments/loadShipment');

async function publishTransactionCommand(deliveryEvent) {
    const {shipmentId} = deliveryEvent;
    const {billToAccountId, cost} = await loadShipment(shipmentId);
    const command = {
        _id: `invoices:shipments:${shipmentId}`,
        type: 'invoice',
        accountId: billToAccountId,
        amount: -1 * cost,
        shipmentId,
    };
    await publish(command);
    console.log('published debit command for delivery', command);
}

function isDeliverEvent(event) {
    return event.type === 'deliver';
}

async function eachMessage({ message }) {
    const event = JSON.parse(message.value);

    if (isDeliverEvent(event)) {
        await publishTransactionCommand(event);
    }
}

module.exports = {
    groupId: 'accounts/invoiceAccountOnShipmentDelivery',
    topic: 'shipment-events',
    eachMessage
};