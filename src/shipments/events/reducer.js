
const reducersByEventType = {
    create: require('./create/createEventReducer'),
    assign: require('./assign/assignEventReducer'),
    shipped: require('./shipped/shippedEventReducer')
};

module.exports = function shipmentEventReducer(shipment, event) {
    const reducer = reducersByEventType[event.eventType];
    if (!reducer) {
        throw new Error(`No reducer found for event ${event._id} of type ${event.eventType}`);
    }
    return reducer(shipment, event);
};