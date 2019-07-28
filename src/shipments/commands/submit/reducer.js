const IllegalShipmentStateError = require('../IllegalShipmentStateError');

module.exports = function submitReducer(shipment, submitCommand) {
    const {shipmentId, timestamp, shipFrom, shipTo, weightInPounds, cost, billToAccountId} = submitCommand;
    if (shipment) {
        throw new IllegalShipmentStateError(`Shipment with id ${shipmentId} already exists`);
    }

    return {
        _id: shipmentId,
        createdTimestamp: timestamp,
        lastCommandTimestamp: timestamp,
        status: 'Submitted',
        shipFrom,
        shipTo,
        weightInPounds,
        billToAccountId,
        cost
    };
};