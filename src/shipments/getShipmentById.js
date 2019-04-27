const shipmentEventsReducer = require('./events/reducer');

async function handler(request, h) {
    const shipmentId = request.params.shipmentId;

    const {shipmentEventsCollection} = request.server.app;
    const events = await shipmentEventsCollection
        .find({shipmentId})
        .sort([['eventTimestamp', 1]])
        .toArray();

    const shipment = events.reduce(shipmentEventsReducer, {});

    return h.response(shipment);
}

module.exports = {
    handler,
    method: 'GET',
    path: '/shipments/{shipmentId}',
};