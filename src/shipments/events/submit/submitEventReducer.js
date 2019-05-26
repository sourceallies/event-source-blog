const IllegalShipmentStateError = require('../IllegalShipmentStateError');

module.exports = function submitEventReducer(shipment, submitEvent) {
    const {shipmentId, eventTimestamp, shipFrom, shipTo, weightInPounds, cost, billToAccountId} = submitEvent;
    if (shipment) {
        throw new IllegalShipmentStateError(`Shipment with id ${shipmentId} already exists`);
    }

    return {
        _id: shipmentId,
        createdTimestamp: eventTimestamp,
        lastEventTimestamp: eventTimestamp,
        status: 'Submitted',
        shipFrom,
        shipTo,
        weightInPounds,
        billToAccountId,
        cost
    };
};