const IllegalShipmentStateError = require('../IllegalShipmentStateError');

function validateShipment(shipment, shipEvent) {
    if (!shipment) {
        throw new IllegalShipmentStateError(`shipment ${shipEvent.shipmentId} does not exist`);
    }

    if ('Assigned' !== shipment.status) {
        throw new IllegalShipmentStateError(`Shipment is in invalid status ${shipment.status}`);
    }
}

module.exports = function shippedEventReducer(shipment, shipEvent) {
    validateShipment(shipment, shipEvent);

    return {
        ...shipment,
        status: 'Shipped',
        lastEventTimestamp: shipEvent.eventTimestamp,
        shipDate: shipEvent.eventTimestamp
    };
};