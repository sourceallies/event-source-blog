const mongoClient = require('../configuredMongoClient');

async function handler(request, h) {
    const _id = request.params.shipmentId;

    const shipment = await mongoClient
        .db('shipment')
        .collection('shipments')
        .findOne({_id});

    if (!shipment) {
        return h.response().code(404);
    }

    return h.response(shipment);
}

module.exports = {
    handler,
    method: 'GET',
    path: '/shipments/{shipmentId}',
};