const IllegalShipmentStateError = require('../IllegalShipmentStateError');

module.exports = function createEventReducer(shipment, createEvent) {
    const {shipmentId, eventTimestamp, shipFrom, shipTo, weightInPounds} = createEvent;
    if (shipment) {
        throw new IllegalShipmentStateError(`Shipment with id ${shipmentId} already exists`);
    }

    return {
        _id: shipmentId,
        createdTimestamp: eventTimestamp,
        status: 'Submitted',
        shipFrom,
        shipTo,
        weightInPounds
    };
};