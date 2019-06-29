const IllegalShipmentStateError = require('../IllegalShipmentStateError');

function validateShipment(shipment, command) {
    if (!shipment) {
        throw new IllegalShipmentStateError(`shipment ${command.shipmentId} does not exist`);
    }

    if ('Assigned' !== shipment.status) {
        throw new IllegalShipmentStateError(`Shipment is in invalid status ${shipment.status}`);
    }
}

module.exports = function shippedEventReducer(shipment, command) {
    validateShipment(shipment, command);

    return {
        ...shipment,
        status: 'Shipped',
        lastCommandTimestamp: command.timestamp,
        shipDate: command.timestamp
    };
};