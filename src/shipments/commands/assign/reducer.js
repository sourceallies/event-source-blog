
const IllegalShipmentStateError = require('../IllegalShipmentStateError');

function validateShipment(shipment, assignEvent) {
    if (!shipment) {
        throw new IllegalShipmentStateError(`shipment ${assignEvent.shipmentId} does not exist`);
    }

    if (!['Submitted', 'Assigned'].includes(shipment.status)) {
        throw new IllegalShipmentStateError(`Shipment is in invalid status ${shipment.status}`);
    }
}

module.exports = function assignEventReducer(shipment, assignEvent) {
    validateShipment(shipment, assignEvent);
    const {truckId, timestamp} = assignEvent;
    return {
        ...shipment,
        status: 'Assigned',
        assignedToTruck: truckId,
        lastCommandTimestamp: timestamp,
    };
};