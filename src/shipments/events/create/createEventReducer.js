
module.exports = function createEventReducer(_, createEvent) {
    const {shipmentId, eventTimestamp, shipFrom, shipTo, weightInPounds} = createEvent;
    return {
        _id: shipmentId,
        createdTimestamp: eventTimestamp,
        status: 'Submitted',
        shipFrom,
        shipTo,
        weightInPounds
    };
};