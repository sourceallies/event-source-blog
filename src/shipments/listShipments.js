const mongoClient = require('../configuredMongoClient');

async function getShipments() {
    return await mongoClient
        .db('shipment')
        .collection('shipments')
        .find()
        .toArray();
}

async function handler(request, h) {
    const shipments = await getShipments();
    return h.response(shipments);
}

module.exports = {
    handler,
    method: 'GET',
    path: '/shipments',
};