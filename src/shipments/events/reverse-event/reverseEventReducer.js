
module.exports = function reverseEventReducer(shipment, reverseEvent) {
    return {
        ...shipment,
        lastEventTimestamp: reverseEvent.eventTimestamp
    };
};