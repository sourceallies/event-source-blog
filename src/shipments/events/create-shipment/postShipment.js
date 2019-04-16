
async function handler(request, h) {
    const shipmentId = request.params.shipmentId;
    const eventTimestamp = new Date(Date.now()).toISOString();

    const createEvent = {
        ...request.payload,
        _id: `${shipmentId}-${eventTimestamp}`,
        shipmentId,
        eventTimestamp
    };

    const {mongoClient} = request.server.app;

    mongoClient
        .db('shipment')
        .collection('shipment_events')
        .insertOne(createEvent);

    request.log(['info'], {createEvent});
    return h.response().code(202);
}

module.exports = {
    handler,
    method: 'POST',
    path: '/shipments/{shipmentId}/events/create-shipment'
};