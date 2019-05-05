
async function handler(request, h) {
    const shipmentId = request.params.shipmentId;
    const {shipmentEventsCollection} = request.server.app;

    const events = await shipmentEventsCollection
        .find({shipmentId})
        .sort([['eventTimestamp', 1]])
        .toArray();

    return h.response(events);
}

module.exports = {
    handler,
    method: 'GET',
    path: '/shipments/{shipmentId}/events',
};