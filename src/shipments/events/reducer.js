
const reducersByEventType = {
    submit: require('./submit/submitEventReducer'),
    assign: require('./assign/assignEventReducer'),
    ship: require('./ship/shipEventReducer'),
    deliver: require('./deliver/deliverEventReducer'),
    tombstone: require('./tombstone/tombstoneEventReducer')
};

module.exports = function shipmentEventReducer(shipment, event) {
    const reducer = reducersByEventType[event.eventType];
    if (!reducer) {
        throw new Error(`No reducer found for event ${event._id} of type ${event.eventType}`);
    }
    return reducer(shipment, event);
};