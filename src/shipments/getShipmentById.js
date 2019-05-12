const loadShipment = require('./loadShipment');

async function handler(request, h) {
    const shipment = await loadShipment(request.params.shipmentId);

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