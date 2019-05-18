
const mongoClient = require('../../configuredMongoClient');


async function handler(request, h) {
    const shipmentId = request.params.shipmentId;

    const events = await mongoClient.db('shipment')
        .collection('shipment_events')
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