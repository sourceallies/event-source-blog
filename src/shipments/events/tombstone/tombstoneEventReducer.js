
module.exports = function tombstoneEventReducer(shipment, tombstoneEvent) {
    return {
        ...shipment,
        lastEventTimestamp: tombstoneEvent.eventTimestamp
    };
};