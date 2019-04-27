
module.exports = function assignEventReducer(shipment, assignEvent) {
    const {truckId} = assignEvent;
    return {
        ...shipment,
        status: 'Assigned',
        assignedToTruck: truckId
    };
};