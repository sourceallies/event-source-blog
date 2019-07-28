
const reducersByEventType = {
    submit: require('./submit/reducer'),
    assign: require('./assign/reducer'),
    ship: require('./ship/reducer'),
    deliver: require('./deliver/reducer')
};

module.exports = function shipmentCommandReducer(shipment, command) {
    const reducer = reducersByEventType[command.type];
    if (!reducer) {
        throw new Error(`No reducer found for event ${command._id} of type ${command.type}`);
    }
    return reducer(shipment, command);
};